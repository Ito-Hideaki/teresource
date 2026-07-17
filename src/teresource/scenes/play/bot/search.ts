import { ControlOrder } from "../controller/controlorder";
import { Mino } from "../core/mechanics";
import { GameContext } from "../infra/context";
import * as TRS from "./trscore";

export const BotOrder = {
    MOVE_LEFT: 1,
    MOVE_RIGHT: 2,
    MOVE_DOWN: 3,
    ROTATE_CLOCK_WISE: 4,
    ROTATE_COUNTER_CLOCK: 5
} as const;

export type BotOrderValue = typeof BotOrder[keyof typeof BotOrder];

type UnconnectedNode = {
    location: TRS.Location;
    parent: undefined;
};

type ConnectedNode = {
    location: TRS.Location;
    parent: Node;
    controlToParent: BotOrderValue;
};

export type Node = UnconnectedNode | ConnectedNode;

export type Path = {
    route: ConnectedNode[];
    goal:  UnconnectedNode;
}

type NodeCell = { [k: number]: Node };
type NodeRow = { [k: number]: NodeCell };
type NodeBoard = { [k: number]: NodeRow };

class NodeUtility {
    private rowCount;
    private columnCount;
    board: NodeBoard;

    constructor(gameContext: GameContext) {
        this.rowCount = gameContext.cellBoard.rowCount;
        this.columnCount = gameContext.cellBoard.columnCount;
        this.board = {};
    }

    getNode(location: TRS.Location) {

        this.board[location.y] ??= {};
        this.board[location.y][location.x] ??= {};
        this.board[location.y][location.x][location.rotation] ??= {
            location: { ...location },
            parent: undefined
        };
        return this.board[location.y][location.x][location.rotation];
    }

    reset() {
        this.board = {};
    }
}

class CollisionUtil {
    private cellBoard;
    private spawnRow;

    constructor(gameContext: GameContext) {
        this.cellBoard = gameContext.cellBoard;
        this.spawnRow = gameContext.currentMinoManager.getSpawnRow();
    }

    isReachableWithHardDrop(location: TRS.Location) {
        const mino = new Mino(location.type, location.rotation);
        const hardDropDiff = Math.max(location.y - this.spawnRow, 0);
        const possibleVerticalMove = this.cellBoard.tryMoveMinoVertically(hardDropDiff, mino, this.spawnRow, location.x);
        return possibleVerticalMove === hardDropDiff;
    }
}

export class RouteSearcher {
    private spawnRow;
    private spawnColumn;
    private nodes;
    private collision;

    constructor(gameContext: GameContext) {
        this.spawnRow = gameContext.currentMinoManager.getSpawnRow();
        this.spawnColumn = gameContext.currentMinoManager.getSpawnColumn();
        this.nodes = new NodeUtility(gameContext);
        this.collision = new CollisionUtil(gameContext);
    }

    search(location: TRS.Location): Path {
        this.nodes.reset();

        const root = this.nodes.getNode(location);

        const path = this.searchWhileUnderground(root);

        return path;
    }

    searchWhileUnderground(root: Node): Path {
        const queue: Node[] = [root];
        let skyRoot: Node | undefined = undefined;
        for(let i = 0; queue.length > i; i++) {
            const node = queue[i];
            if(this.collision.isReachableWithHardDrop(node.location)) {
                skyRoot = node;
                break;
            }
            const children = this.getEachChildNode(node);
            for(const child of children) {
                const childNode = child[1];
                if(!childNode.parent) {
                    const modifyNode: any = childNode;
                    modifyNode.parent = node;
                    modifyNode.controlToParent = child[0];
                    queue.push(modifyNode);
                }
            }
        }
        if(!skyRoot) throw "unable to reach the sky";
        const path = this.recursivelyGeneratePath(skyRoot);
        return path;
    }

    private getEachChildNode(node: Node) {
        const { x, y, rotation } = node.location;
        const nodes: [BotOrderValue, Node][] = [
            [BotOrder.MOVE_LEFT, this.nodes.getNode({ ...node.location, x: x+1 })],
            [BotOrder.MOVE_RIGHT, this.nodes.getNode({ ...node.location, x: x-1 })]
        ];
        //verify nodes if it's reachable
        return nodes;
    }

    private recursivelyGeneratePath(leaf: Node): Path {
        let current: Node = leaf;
        const route: ConnectedNode[] = [];
        let root: undefined | UnconnectedNode = undefined;
        while(!root) {
            if(current.parent) {
                route.push(current);
                current = current.parent;
            } else {
                root = current;
            }
        }
        return { route, goal: root };
    }
}
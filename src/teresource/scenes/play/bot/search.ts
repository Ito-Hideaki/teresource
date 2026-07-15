import { ControlOrder } from "../controller/controlorder";
import { Mino } from "../core/mechanics";
import { GameContext } from "../infra/context";
import * as TRS from "./trscore";

type UnconnectedNode = {
    location: TRS.Location;
};

type ConnectedNode = UnconnectedNode & {
    depth: number;
    parent: Node;
    controlToParent: number;
};

type Node = UnconnectedNode | ConnectedNode;

type Path = [UnconnectedNode, ...ConnectedNode[]];

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
            location: { ...location }
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
        const hardDropDiff = Math.max(this.spawnRow - location.y, 0);
        const possibleVerticalMove = this.cellBoard.tryMoveMinoVertically(hardDropDiff, mino, location.y, location.x);
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
            //get each child node
            //if it had not been discovered
            //set depth and parent
            //add to the queue
        }
        if(!skyRoot) { throw "unable to reach the sky" } //do some exception

        //generate route

        return [skyRoot];
    }

    private getEachChildNode(node: Node) {
        const { x, y, rotation } = node.location;
        const nodes: [number, Node][] = [
            [ControlOrder.MOVE_LEFT, this.nodes.getNode({ ...node.location, x: x+1 })],
            [ControlOrder.MOVE_RIGHT, this.nodes.getNode({ ...node.location, x: x-1 })]
        ];
        //verify nodes if it's reachable
        return nodes;
    }
}
import { Mino } from "../core/mechanics";
import { GameContext } from "../infra/context";
import * as TRS from "./trscore";

type Node = {
    location: TRS.Location;
    depth: number;
    parent: Node | undefined;
};

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
            depth: -1,
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

    search(location: TRS.Location): TRS.Location[] {
        this.nodes.reset();

        const root = this.nodes.getNode(location);
        root.depth = 0;

        const route: Node[] = this.searchWhileUnderground(root);
        const skyRoot = route.at(-1);

        //move vertically

        //move horizontally

        //rotate

        return route.map(node => node.location);
    }

    searchWhileUnderground(root: Node): Node[] {
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
}
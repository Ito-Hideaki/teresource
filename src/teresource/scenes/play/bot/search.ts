import { MinoType } from "../core/coredata";
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

    getNode(location: TRS.Location, parent: Node) {

        this.board[location.y] ??= {};
        this.board[location.y][location.x] ??= {};
        this.board[location.y][location.x][location.rotation] ??= {
            location: { ...location },
            depth: -1,
            parent: undefined
        };
        return this.board[location.y][location.x][location.rotation];
    }
}

import { CellBoard, BoardSize } from "./mechanics";
import { CurrentMinoManager, MinoQueueManager } from "./minomanager";
import { BoardControlState } from "./boardcontroller";

/** @param {{}} source @return GameContext */
export class GameContext {
    /** @type BoardSize */
    boardSize
    /** @type CellBoard */
    cellBoard
    /** @type {CurrentMinoManager} */
    currentMinoManager
    /** @type {MinoQueueManager} */
    minoQueueManager
    /** @type {BoardControlState} */
    boardControlState

    constructor(source) {
        this.cellBoard          = source.cellBoard;
        this.boardSize          = source.boardSize;
        this.currentMinoManager = source.currentMinoManager;
        this.minoQueueManager   = source.minoQueueManager;
        this.boardControlState  = source.boardControlState;
    }
}
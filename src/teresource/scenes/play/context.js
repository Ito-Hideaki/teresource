import { CellBoard, BoardSize, Mino } from "./mechanics";
import { CurrentMinoManager, MinoQueueManager } from "./minomanager";
import { BoardControlState } from "./boardcontroller";
import { CellSheetParent } from "./customtexture";

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

    /** 
     * @param {{
     * cellBoard         : CellBoard,
     * boardSize         : BoardSize,
     * currentMinoManager: CurrentMinoManager,
     * minoQueueManager  : MinoQueueManager,
     * boardControlState : BoardControlState,
     * }} source
     * */
    constructor(source) {
        this.cellBoard          = source.cellBoard;
        this.boardSize          = source.boardSize;
        this.currentMinoManager = source.currentMinoManager;
        this.minoQueueManager   = source.minoQueueManager;
        this.boardControlState  = source.boardControlState;
    }
}

export class GameViewContext {
    /** @type {CellSheetParent} */
    cellSheetParent
    /** @type {GameContext} */
    gameContext

    /** 
     * @param {{
     * cellSheetParent: CellSheetParent,
     * gameContext    : GameContext
     * }} source
     * */
    constructor(source) {
        this.cellSheetParent = source.cellSheetParent;
        this.gameContext     = source.gameContext;
    }
}
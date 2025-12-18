import { CellBoard, BoardSize, Mino } from "./mechanics";
import { CurrentMinoManager, MinoQueueManager } from "./minomanager";
import { BoardControlState } from "./boardcontroller";
import { CellSheetParent } from "./customtexture";
import { RotationSystem } from "./rotationsystem";

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
    /** @type {RotationSystem} */
    rotationSystem

    /** 
     * @param {{
     * cellBoard         : CellBoard,
     * boardSize         : BoardSize,
     * currentMinoManager: CurrentMinoManager,
     * minoQueueManager  : MinoQueueManager,
     * boardControlState : BoardControlState,
     * rotationSystem    : RotationSystem,
     * }} source
     * */
    constructor(source) {
        this.cellBoard          = source.cellBoard;
        this.boardSize          = source.boardSize;
        this.currentMinoManager = source.currentMinoManager;
        this.minoQueueManager   = source.minoQueueManager;
        this.boardControlState  = source.boardControlState;
        this.rotationSystem     = source.rotationSystem;
    }
}

export class GameViewContext {
    /** @type {CellSheetParent} */
    cellSheetParent
    /** @type {GameContext} */
    gameContext
    /** @type {Phaser.GameObjects.Container} */
    boardContainer

    /** 
     * @param {{
     * cellSheetParent: CellSheetParent,
     * gameContext    : GameContext,
     * boardContainer : Phaser.GameObjects.Container
     * }} source
     * */
    constructor(source) {
        this.cellSheetParent = source.cellSheetParent;
        this.gameContext     = source.gameContext;
        this.boardContainer  = source.boardContainer;
    }
}
import { CellBoard, BoardSize, Mino } from "../core/mechanics";
import { CurrentMinoManager, MinoQueueManager } from "../core/minomanager";
import { BoardUpdateState } from "../controller/boardcontroller";
import { CellSheetParent } from "../view/customtexture";
import { RotationSystem } from "../core/rotationsystem";

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
    /** @type {BoardUpdateState} */
    boardUpdateState
    /** @type {RotationSystem} */
    rotationSystem

    /** 
     * @param {{
     * cellBoard         : CellBoard,
     * boardSize         : BoardSize,
     * currentMinoManager: CurrentMinoManager,
     * minoQueueManager  : MinoQueueManager,
     * boardUpdateState  : BoardUpdateState,
     * rotationSystem    : RotationSystem,
     * }} source
     * */
    constructor(source) {
        this.cellBoard          = source.cellBoard;
        this.boardSize          = source.boardSize;
        this.currentMinoManager = source.currentMinoManager;
        this.minoQueueManager   = source.minoQueueManager;
        this.boardUpdateState   = source.boardUpdateState;
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
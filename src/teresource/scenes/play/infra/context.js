import { CellBoard, BoardSize } from "../core/mechanics";
import { CurrentMinoManager, HeldMinoManager, MinoQueueManager } from "../core/minomanager";
import { BoardUpdateState } from "../controller/boardcontroller";
import { CellSheetParent } from "../view/customtexture";
import { RotationSystem } from "../core/rotationsystem";
import { GameReportStack } from "../controller/report";

/** @param {{}} source @return GameContext */
export class GameContext {

    /** 
     * @param {{
     * cellBoard         : CellBoard,
     * boardSize         : BoardSize,
     * currentMinoManager: CurrentMinoManager,
     * minoQueueManager  : MinoQueueManager,
     * heldMinoManager   : HeldMinoManager,
     * boardUpdateState  : BoardUpdateState,
     * rotationSystem    : RotationSystem,
     * gameReportStack   : GameReportStack
     * }} source
     * */
    constructor(source) {
        this.cellBoard          = source.cellBoard;
        this.boardSize          = source.boardSize;
        this.currentMinoManager = source.currentMinoManager;
        this.minoQueueManager   = source.minoQueueManager;
        this.heldMinoManager    = source.heldMinoManager;
        this.boardUpdateState   = source.boardUpdateState;
        this.rotationSystem     = source.rotationSystem;
        this.gameReportStack    = source.gameReportStack;
    }
}

export class GameViewContext {
    /** @type {CellSheetParent} */ cellSheetParent
    /** @type {GameContext} */ gameContext
    /** @type {Phaser.GameObjects.Container} */ boardContainer
    /** @type {Function} */ getRelativeBoardY
    /** @type {Function} */ getRelativeBoardX

    /** 
     * @param {{
     * cellSheetParent  : CellSheetParent,
     * gameContext      : GameContext,
     * boardContainer   : Phaser.GameObjects.Container,
     * getRelativeBoardX: Function,
     * getRelativeBoardY: Function
     * }} source
     * */
    constructor(source) {
        this.cellSheetParent = source.cellSheetParent;
        this.gameContext     = source.gameContext;
        this.boardContainer  = source.boardContainer;
        this.getRelativeBoardX    = source.getRelativeBoardX;
        this.getRelativeBoardY    = source.getRelativeBoardY;
    }
}
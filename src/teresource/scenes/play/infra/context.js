import { CellBoard, BoardSize } from "../core/mechanics";
import { CurrentMinoManager, HeldMinoManager, MinoQueueManager } from "../core/minomanager";
import { BoardUpdateState, ControlOrderProvider } from "../controller/boardcontroller";
import { CellSheetParent } from "../view/customtexture";
import { RotationSystem } from "../core/rotationsystem";
import { GameReportStack } from "../controller/report";
import { GameStats, GameStatsManager } from "../controller/stats";
import { GameAttackState } from "../core/attack";
import { LineClearManager } from "../core/lineclear";
import { GameScheduledDamageState } from "../core/garbage";

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

export class GameHighContext {
    /**
     *  @param {{
     *     gameStats: GameStats,
     *     gameStatsManager: GameStatsManager,
     *     gameAttackState: GameAttackState,
     *     controlOrderProvider: ControlOrderProvider,
     *     lineClearManager : LineClearManager,
     * garbageGenerator  : GarbageGenerator,
     * scheduledDamageState : GameScheduledDamageState,
     * }} source
     * */
    constructor(source) {
        this.gameStats        = source.gameStats;
        this.gameStatsManager = source.gameStatsManager;
        this.gameAttackState  = source.gameAttackState;
        this.controlOrderProvider = source.controlOrderProvider;
        this.lineClearManager = source.lineClearManager;
        this.garbageGenerator   = source.garbageGenerator;
        this.scheduledDamageState = source.scheduledDamageState;
    }
}

export class GameViewContext {
    /** 
     * @param {{
     * cellSheetParent  : CellSheetParent,
     * gameContext      : GameContext,
     * gameHighContext  : GameHighContext,
     * boardContainer   : Phaser.GameObjects.Container,
     * getRelativeBoardX: Function,
     * getRelativeBoardY: Function,
     * getBoardCellWidth: () => number,
     * displayedBoardArea: BoardArea
     * }} source
     * */
    constructor(source) {
        this.cellSheetParent = source.cellSheetParent;
        this.gameContext     = source.gameContext;
        this.gameHighContext = source.gameHighContext;
        this.boardContainer  = source.boardContainer;
        this.getRelativeBoardX    = source.getRelativeBoardX;
        this.getRelativeBoardY    = source.getRelativeBoardY;
        this.getBoardCellWidth    = source.getBoardCellWidth;
        this.displayedBoardArea = source.displayedBoardArea;
    }
}
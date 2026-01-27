import { ControlOrder, BoardUpdater, ControlOrderProvider, BoardUpdateDiff } from "./boardcontroller";
import { GameContext } from "../infra/context";
import { LineClearManager } from "../core/lineclear";
import { LineClearReport, GameReportStack } from "./report";
import { GameAttackState } from "../core/attack";

/** Represents the logic og the game attached to each player */
export class GameController {

    #boardUpdater
    #controlOrderProvider
    #currentMinoManager
    #minoQueueManager
    #heldMinoManager
    #boardUpdateState
    #gameReportStack

    /**
     * @param {GameContext} gameContext
     * @param {{boardUpdater: BoardUpdater, controlOrderProvider: ControlOrderProvider, lineClearManager: LineClearManager, gameAttackState: GameAttackState }} $
     */
    constructor(gameContext, $) {
        this.#controlOrderProvider = $.controlOrderProvider;
        this.#boardUpdater = $.boardUpdater;
        this.lineClearManager = $.lineClearManager;
        this.gameAttackState = $.gameAttackState

        this.#minoQueueManager = gameContext.minoQueueManager;
        this.#currentMinoManager = gameContext.currentMinoManager;
        this.#heldMinoManager = gameContext.heldMinoManager;
        this.#boardUpdateState = gameContext.boardUpdateState;
        this.#gameReportStack = gameContext.gameReportStack;
    }

    /** @param {number} deltaTime */
    update(deltaTime) {

        this.#gameReportStack.renewAll();

        this.lineClearManager.update(deltaTime);

        if(!this.lineClearManager.isDuringLineClear()) {
            this.#doNormalUpdate(deltaTime);
        }

        this.#gameReportStack.lineClear.forEach(lineClearReport => {
            const lineCount = lineClearReport.data.clearedRowList.length;
            window.log(`${lineCount} line(s) cleared`);
        });
    }

    #doNormalUpdate(deltaTime) {
        const putNewMino = (mino) => {
            this.#currentMinoManager.startNextMino(mino);
            this.#boardUpdateState.startNewMino();
            this.#controlOrderProvider.resetARR();
        }

        /** @type {ControlOrder} */ const controlOrder = this.#controlOrderProvider.provideControlOrder();

        if (this.#currentMinoManager.isPlaced) {
            this.#heldMinoManager.resetLimit();
            putNewMino(this.#minoQueueManager.takeNextMino());
        }
        if (controlOrder.get(ControlOrder.HOLD) && this.#heldMinoManager.canRecieveMino()) {
            const recievedMino = this.#heldMinoManager.recieveMino(this.#currentMinoManager.mino);
            putNewMino( recievedMino ?? this.#minoQueueManager.takeNextMino());
        }

        /** @type {BoardUpdateDiff} */ const boardUpdateDiff = this.#boardUpdater.update(controlOrder.value, deltaTime);
        this.#controlOrderProvider.receiveControlResult(boardUpdateDiff);
        this.#controlOrderProvider.advanceTime(deltaTime);
        //Clear filled line (row)
        const rowToClearList = this.lineClearManager.findRowToClearList();
        this.lineClearManager.startClear(rowToClearList);

        //Update attack state
        this.gameAttackState.update(boardUpdateDiff, rowToClearList.length);

        if(rowToClearList.length) {
            const reportData = this.gameAttackState.createLineClearAttackData(rowToClearList);
            this.#gameReportStack.add(new LineClearReport(reportData));
        }
    }
}
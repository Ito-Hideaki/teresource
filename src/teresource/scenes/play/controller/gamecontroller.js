import { ControlOrder, BoardUpdater, ControlOrderProvider, BoardUpdateDiff } from "./boardcontroller";
import { GameContext, GameHighContext } from "../infra/context";
import { LineClearManager } from "../core/lineclear";
import { LineClearReport, GameReportStack } from "./report";
import { GameAttackState } from "../core/attack";
import { GameStatsManager } from "./stats";
import { createFunction_DoesCurrentMinoCollide } from "./gameover";
import { GameSession } from "./gamesession";

/** Represents the logic og the game attached to each player */
export class GameController {

    #boardUpdater
    /** @type {ControlOrderProvider} */#controlOrderProvider
    #currentMinoManager
    #minoQueueManager
    #heldMinoManager
    #boardUpdateState
    /** @type {GameReportStack} */#gameReportStack
    /** @type {GameStatsManager} */ #gameStatsManager
    /** @type {LineClearManager} */ lineClearManager
    /** @type {GameAttackState} */ gameAttackState
    #doesCurrentMinoCollide

    /** @type {GameSession} */ session

    /**
     * @param {GameContext} gameContext
     * @param {GameHighContext} gameHighContext
     */
    constructor(gameContext, gameHighContext) {
        this.#controlOrderProvider = gameHighContext.controlOrderProvider;
        this.#boardUpdater = new BoardUpdater(gameContext);
        this.lineClearManager = gameHighContext.lineClearManager;
        this.gameAttackState = gameHighContext.gameAttackState;
        this.#gameStatsManager = gameHighContext.gameStatsManager;
        this.session = new GameSession(gameHighContext);

        this.#minoQueueManager = gameContext.minoQueueManager;
        this.#currentMinoManager = gameContext.currentMinoManager;
        this.#heldMinoManager = gameContext.heldMinoManager;
        this.#boardUpdateState = gameContext.boardUpdateState;
        this.#gameReportStack = gameContext.gameReportStack;
        this.#doesCurrentMinoCollide = createFunction_DoesCurrentMinoCollide(gameContext);
    }

    /** @param {number} deltaTime */
    update(deltaTime) {

        this.#gameReportStack.renewAll();

        this.lineClearManager.update(deltaTime);

        if (!this.lineClearManager.isDuringLineClear() && !this.session.isOver) {
            (() => {
                //check if the game has reached session goal
                if (this.session.isTargetCompleted()) {
                    this.session.markAsOver();
                    return;
                }

                //Take new mino from queue
                if (this.#currentMinoManager.isPlaced) {
                    this.#heldMinoManager.resetLimit();
                    this.#putNewMino(this.#minoQueueManager.takeNextMino());
                }

                if (this.#doesCurrentMinoCollide()) {
                    this.session.markAsOver();
                    return;
                }

                //Take held mino
                /** @type {ControlOrder} */ const controlOrder = this.#controlOrderProvider.provideControlOrder();
                if (controlOrder.get(ControlOrder.HOLD) && this.#heldMinoManager.canRecieveMino()) {
                    const recievedMino = this.#heldMinoManager.recieveMino(this.#currentMinoManager.mino);
                    this.#putNewMino(recievedMino ?? this.#minoQueueManager.takeNextMino());
                }

                if (this.#doesCurrentMinoCollide()) {
                    this.session.markAsOver();
                    return;
                }

                //Finally update board
                this.#doNormalUpdate(deltaTime, controlOrder);
            })();
        }

        //update status
        if (!this.session.isOver) {
            this.#gameStatsManager.update(deltaTime);

            this.#gameReportStack.lineClear.forEach(lineClearReport => {
                const lineCount = lineClearReport.data.clearedRowList.length;
                window.log(`${lineCount} line(s) cleared`);
            });
        }
    }

    /** @param {ControlOrder} controlOrder */
    #doNormalUpdate(deltaTime, controlOrder) {
        /** @type {BoardUpdateDiff} */ const boardUpdateDiff = this.#boardUpdater.update(controlOrder.value, deltaTime);
        this.#controlOrderProvider.receiveControlResult(boardUpdateDiff);
        this.#controlOrderProvider.advanceTime(deltaTime);
        //Clear filled line (row)
        const rowToClearList = this.lineClearManager.findRowToClearList();
        this.lineClearManager.startClear(rowToClearList);

        //Update attack state
        this.gameAttackState.update(boardUpdateDiff, rowToClearList.length);

        //do line clear effect
        if (rowToClearList.length) {
            const reportData = this.gameAttackState.createLineClearAttackData(rowToClearList);
            this.#gameReportStack.add(new LineClearReport(reportData));
            this.#gameStatsManager.setNewLineClearAttackData(reportData);
        }
    }

    #putNewMino(mino) {
        this.#currentMinoManager.startNextMino(mino);
        this.#boardUpdateState.startNewMino();
        this.#controlOrderProvider.resetARR();
    }

    /** Can be called anytime @type {GameSession} session */
    setSession(session) {
        this.session = session;
    }

    isOver() {
        return this.session.isOver;
    }
}
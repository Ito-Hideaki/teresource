import { BoardUpdater, BoardUpdateDiff } from "./boardcontroller";
import { ControlOrder, ControlOrderProvider } from "./controlorder";
import { GameContext, GameHighContext } from "../infra/context";
import { LineClearManager } from "../core/lineclear";
import { LineClearReport, GameReportStack, RecieveScheduledDamageReport } from "./report";
import { GameAttackState, LineClearAttackData } from "../core/attack";
import { GameStatsManager } from "./stats";
import { createFunction_DoesCurrentMinoCollide } from "./gameover";
import { GameSession } from "./gamesession";
import { GameScheduledDamageState, GarbageGenerator, LinearDamageProvider } from "../core/garbage";

/**
 *  @typedef {{
 *      damagePerMino: number
 *  }}
 * AutoDamageConfig */

/** Update the game */
export class GameUpdator {

    #gameHighContext;

    //References
    #boardUpdater
    /** @type {ControlOrderProvider} */#controlOrderProvider
    #currentMinoManager
    #minoQueueManager
    #heldMinoManager
    #boardUpdateState
    /** @type {LinearDamageProvider} */
    #damageProviderPerMino
    /** @type {GameReportStack} */#gameReportStack
    /** @type {GameStatsManager} */ #gameStatsManager
    /** @type {LineClearManager} */ lineClearManager
    /** @type {GameAttackState} */ gameAttackState
    #doesCurrentMinoCollide
    /** @type {GarbageGenerator} */ #garbageGenerator
    #gravityPowerBase

    //States
    /** @type {boolean} set in every NormalUpdate. Garbage is allowed to be added only when it's true. */
    allowGarbageNext
    /** @type {GameScheduledDamageState} */ scheduledDamageState
    /** @type {GameSession} */ session

    /**
     * @param {GameContext} gameContext
     * @param {GameHighContext} gameHighContext
     * @param {number} gravityPower
     */
    constructor(gameContext, gameHighContext, gravityPowerBase, { damageProviderPerMino }) {
        this.#controlOrderProvider = gameHighContext.controlOrderProvider;
        this.#boardUpdater = new BoardUpdater(gameContext);
        this.lineClearManager = gameHighContext.lineClearManager;
        this.gameAttackState = gameHighContext.gameAttackState;
        this.#gameStatsManager = gameHighContext.gameStatsManager;
        this.#garbageGenerator = gameHighContext.garbageGenerator;
        this.#gravityPowerBase = gravityPowerBase;

        this.scheduledDamageState = gameHighContext.scheduledDamageState;

        this.#damageProviderPerMino = damageProviderPerMino;

        this.#minoQueueManager = gameContext.minoQueueManager;
        this.#currentMinoManager = gameContext.currentMinoManager;
        this.#heldMinoManager = gameContext.heldMinoManager;
        this.#boardUpdateState = gameContext.boardUpdateState;
        this.#gameReportStack = gameContext.gameReportStack;
        this.#doesCurrentMinoCollide = createFunction_DoesCurrentMinoCollide(gameContext);

        this.#gameHighContext = gameHighContext;
    }

    /** @param {number} deltaTime */
    update(deltaTime) {

        const result = {
            placed: false,
            /** @type {LineClearAttackData | undefined} */ lineClearAttackData: undefined
        };

        this.#gameReportStack.renewAll(); //move

        this.lineClearManager.update(deltaTime);

        if (!this.lineClearManager.isDuringLineClear() && !this.session.isOver) {
            (() => {
                //add garbage
                if (this.allowGarbageNext) {
                    const damageStack = this.scheduledDamageState.damageStack;
                    let scheduledDamage = damageStack[0];
                    while (scheduledDamage && scheduledDamage.arrived) {
                        damageStack.splice(0, 1);
                        this.#garbageGenerator.addGarbage(scheduledDamage.length);

                        scheduledDamage = damageStack[0];
                    }
                }

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
                const { boardUpdateDiff, lineClearAttackData } = this.#doNormalUpdate(deltaTime, controlOrder);
                if (boardUpdateDiff.placed) result.placed = true;
                result.lineClearAttackData = lineClearAttackData;
            })();
        }

        //update stats
        if (!this.session.isOver) {
            this.#gameStatsManager.update(deltaTime);

            this.#gameReportStack.lineClear.forEach(lineClearReport => {
                const lineCount = lineClearReport.data.clearedRowList.length;
                window.log(`${lineCount} line(s) cleared`);
            });
        }

        //auto damage
        if (result.placed) {
            this.#damageProviderPerMino.count();
            const damages = this.#damageProviderPerMino.provide();
            for (const damage of damages) this.addScheduledDamage(damage, 2);
        }

        //update scheduled damages state
        this.scheduledDamageState.damageStack.forEach(scheduledDamage => {
            if(!scheduledDamage.arrived && scheduledDamage.arriveBy <= this.#gameStatsManager.stats.timePassed) {
                scheduledDamage.arrived = true;
            }
        });

        return result;
    }

    /** @param {ControlOrder} controlOrder */
    #doNormalUpdate(deltaTime, controlOrder) {
        //update gravity
        this.#boardUpdateState.gravity = 0.5 * this.#gravityPowerBase ** this.#gameStatsManager.stats.level;

        /** @type {BoardUpdateDiff} */ const boardUpdateDiff = this.#boardUpdater.update(controlOrder.value, deltaTime);
        this.#controlOrderProvider.receiveControlResult(boardUpdateDiff);
        this.#controlOrderProvider.advanceTime(deltaTime);

        //Clear filled line (row)
        const rowToClearList = this.lineClearManager.findRowToClearList();
        const clearedRowList = this.lineClearManager.startClear(rowToClearList);

        //Update attack state
        this.gameAttackState.update(boardUpdateDiff, rowToClearList.length); //refactor

        const lineClearAttackData = boardUpdateDiff.placed ? this.gameAttackState.createLineClearAttackData(rowToClearList) : undefined;

        //Start line clear effect
        if (boardUpdateDiff.placed && rowToClearList.length) {
            this.#gameReportStack.add(new LineClearReport(lineClearAttackData, clearedRowList));
            this.#gameStatsManager.setNewLineClearAttackData(lineClearAttackData);
        }

        //Garbage
        this.allowGarbageNext = boardUpdateDiff.placed;

        return { boardUpdateDiff, lineClearAttackData };
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

    /** Can be called anytime @param {import("./gamesession").GameSessionConfig} config */
    setSessionFromConfig(config) {
        this.session = new GameSession(this.#gameHighContext, config);
    }

    isOver() {
        return this.session.isOver;
    }

    /** @param {number } length @param {number} delay_s */
    addScheduledDamage(length, delay_s) {
        const scheduledDamage = {
            length,
            arriveBy: this.#gameStatsManager.stats.timePassed + delay_s,
            arrived: false
        };
        this.scheduledDamageState.damageStack.push(scheduledDamage);
        this.#gameReportStack.add(new RecieveScheduledDamageReport(scheduledDamage));
    }
}
import { BoardUpdater, BoardUpdateDiff } from "./boardcontroller";
import { ControlOrder, ControlOrderProvider } from "./controlorder";
import { GameContext, GameHighContext } from "../infra/context";
import { LineClearManager } from "../core/lineclear";
import { LineClearReport, GameReportStack, RecieveScheduledDamageReport, Report } from "./report";
import { GameAttackState, LineClearAttackData } from "../core/attack";
import { GameStatsManager } from "./stats";
import { createFunction_DoesCurrentMinoCollide } from "./gameover";
import { GameSession, GameSessionConfig } from "./gamesession";
import { GameScheduledDamageState, GarbageGenerator, LinearDamageProvider } from "../core/garbage";

declare global {
    interface Window {
        log: (...args: unknown[]) => void;
    }
}

export type AutoDamageConfig = {
    damagePerMino: number;
};

export type OutgoingAttack = { amount: number, delay_s: number };

type UpdateResult = {
    placed: boolean;
    lineClearAttackData?: LineClearAttackData;
    outgoingAttack?: OutgoingAttack;
};

type NormalUpdateResult = {
    boardUpdateDiff: BoardUpdateDiff;
    lineClearAttackData: LineClearAttackData | undefined;
};

/** Update the game */
export class GameUpdator {

    private gameHighContext: GameHighContext;

    //References
    private boardUpdater: BoardUpdater;
    private controlOrderProvider: ControlOrderProvider;
    private currentMinoManager: GameContext["currentMinoManager"];
    private minoQueueManager: GameContext["minoQueueManager"];
    private heldMinoManager: GameContext["heldMinoManager"];
    private boardUpdateState: GameContext["boardUpdateState"];
    private damageProviderPerMino: LinearDamageProvider;
    private gameReportStack: GameReportStack;
    private gameStatsManager: GameStatsManager;
    lineClearManager: LineClearManager;
    gameAttackState: GameAttackState;
    private doesCurrentMinoCollide: () => boolean;
    private garbageGenerator: GarbageGenerator;
    private gravityPowerBase: number;

    //States
    allowGarbageNext: boolean;
    scheduledDamageState: GameScheduledDamageState;
    session!: GameSession;

    private static asReport(report: unknown): Report {
        return report as unknown as Report;
    }

    constructor(
        gameContext: GameContext,
        gameHighContext: GameHighContext,
        gravityPowerBase: number,
        { damageProviderPerMino }: { damageProviderPerMino: LinearDamageProvider }
    ) {
        this.controlOrderProvider = gameHighContext.controlOrderProvider;
        this.boardUpdater = new BoardUpdater(gameContext);
        this.lineClearManager = gameHighContext.lineClearManager;
        this.gameAttackState = gameHighContext.gameAttackState;
        this.gameStatsManager = gameHighContext.gameStatsManager;
        this.garbageGenerator = gameHighContext.garbageGenerator;
        this.gravityPowerBase = gravityPowerBase;

        this.scheduledDamageState = gameHighContext.scheduledDamageState;

        this.damageProviderPerMino = damageProviderPerMino;

        this.minoQueueManager = gameContext.minoQueueManager;
        this.currentMinoManager = gameContext.currentMinoManager;
        this.heldMinoManager = gameContext.heldMinoManager;
        this.boardUpdateState = gameContext.boardUpdateState;
        this.gameReportStack = gameContext.gameReportStack;
        this.doesCurrentMinoCollide = createFunction_DoesCurrentMinoCollide(gameContext);
        this.allowGarbageNext = false;

        this.gameHighContext = gameHighContext;
    }

    update(deltaTime: number): UpdateResult {

        const result: UpdateResult = {
            placed: false
        };

        this.gameReportStack.renewAll(); //move

        this.lineClearManager.update(deltaTime);

        if (!this.lineClearManager.isDuringLineClear() && !this.session.isOver) {
            //add garbage
            if (this.allowGarbageNext) {
                const damageStack = this.scheduledDamageState.damageStack;
                let scheduledDamage = damageStack[0];
                while (scheduledDamage && scheduledDamage.arrived) {
                    damageStack.splice(0, 1);
                    this.garbageGenerator.addGarbage(scheduledDamage.length);

                    scheduledDamage = damageStack[0];
                }
            }

            //check if the game has reached session goal
            if (this.session.isTargetCompleted()) {
                this.session.markAsOver();
                return result;
            }

            //Take new mino from queue
            if (this.currentMinoManager.isPlaced) {
                this.heldMinoManager.resetLimit();
                this.putNewMino(this.minoQueueManager.takeNextMino());
            }

            if (this.doesCurrentMinoCollide()) {
                this.session.markAsOver();
                return result;
            }

            //Take held mino
            const controlOrder = this.controlOrderProvider.provideControlOrder();
            if (controlOrder.get(ControlOrder.HOLD) && this.heldMinoManager.canRecieveMino()) {
                const recievedMino = this.heldMinoManager.recieveMino(this.currentMinoManager.mino);
                this.putNewMino(recievedMino ?? this.minoQueueManager.takeNextMino());
            }

            if (this.doesCurrentMinoCollide()) {
                this.session.markAsOver();
                return result;
            }

            //Finally update board
            const { boardUpdateDiff, lineClearAttackData } = this.doNormalUpdate(deltaTime, controlOrder);
            if (boardUpdateDiff.placed) result.placed = true;
            result.lineClearAttackData = lineClearAttackData;
        }

        //create outgoing attack
        if(result.lineClearAttackData) {
            let amountRemain = result.lineClearAttackData.damage;

            //offset
            while(amountRemain > 0 && this.scheduledDamageState.damageStack.length) {
                const scheduledDamage = this.scheduledDamageState.damageStack[0];
                const offset = Math.min(amountRemain, scheduledDamage.length);
                amountRemain -= offset;
                scheduledDamage.length -= offset;
                if(scheduledDamage.length === 0) this.scheduledDamageState.damageStack.splice(0, 1);
            }

            if(amountRemain) {
                result.outgoingAttack = { amount: amountRemain, delay_s: 2 };
            }
        }

        //update stats
        if (!this.session.isOver) {
            this.gameStatsManager.update(deltaTime);

            this.gameReportStack.lineClear.forEach((lineClearReport) => {
                const lineCount = lineClearReport.data.clearedRowList.length;
                window.log(`${lineCount} line(s) cleared`);
            });
        }

        //auto damage
        if (result.placed) {
            this.damageProviderPerMino.count();
            const damages = this.damageProviderPerMino.provide();
            for (const damage of damages) this.addScheduledDamage(damage, 2);
        }

        //update scheduled damages state
        this.scheduledDamageState.damageStack.forEach((scheduledDamage) => {
            if(!scheduledDamage.arrived && scheduledDamage.arriveBy <= this.gameStatsManager.stats.timePassed) {
                scheduledDamage.arrived = true;
            }
        });

        return result;
    }

    private doNormalUpdate(deltaTime: number, controlOrder: ControlOrder): NormalUpdateResult {
        //update gravity
        this.boardUpdateState.gravity = 0.5 * this.gravityPowerBase ** this.gameStatsManager.stats.level;

        const boardUpdateDiff: BoardUpdateDiff = this.boardUpdater.update(controlOrder.value, deltaTime);
        this.controlOrderProvider.receiveControlResult(boardUpdateDiff);
        this.controlOrderProvider.advanceTime(deltaTime);

        //Clear filled line (row)
        const rowToClearList = this.lineClearManager.findRowToClearList();
        const clearedRowList = this.lineClearManager.startClear(rowToClearList);

        //Update attack state
        this.gameAttackState.update(boardUpdateDiff, rowToClearList.length); //refactor

        const lineClearAttackData = boardUpdateDiff.placed
            ? this.gameAttackState.createLineClearAttackData(rowToClearList)
            : undefined;

        //Start line clear effect
        if (boardUpdateDiff.placed && rowToClearList.length && lineClearAttackData) {
            this.gameReportStack.add(GameUpdator.asReport(new LineClearReport(lineClearAttackData, clearedRowList)));
            this.gameStatsManager.setNewLineClearAttackData(lineClearAttackData);
        }

        //Garbage
        this.allowGarbageNext = boardUpdateDiff.placed;

        return { boardUpdateDiff, lineClearAttackData };
    }

    private putNewMino(mino: GameContext["currentMinoManager"]["mino"]): void {
        this.currentMinoManager.startNextMino(mino);
        this.boardUpdateState.startNewMino();
        this.controlOrderProvider.resetARR();
    }

    setSession(session: GameSession): void {
        this.session = session;
    }

    setSessionFromConfig(config: GameSessionConfig): void {
        this.session = new GameSession(this.gameHighContext, config);
    }

    isOver(): boolean {
        return this.session.isOver;
    }

    addScheduledDamage(length: number, delay_s: number): void {
        const scheduledDamage = {
            length,
            arriveBy: this.gameStatsManager.stats.timePassed + delay_s,
            arrived: false
        };
        this.scheduledDamageState.damageStack.push(scheduledDamage);
        this.gameReportStack.add(GameUpdator.asReport(new RecieveScheduledDamageReport(scheduledDamage)));
    }
}

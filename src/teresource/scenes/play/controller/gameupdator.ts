import { BoardUpdater, BoardUpdateDiff } from "./boardcontroller";
import { ControlOrder, ControlOrderProvider } from "./controlorder";
import { GameContext, GameHighContext } from "../infra/context";
import { LineClearManager } from "../core/lineclear";
import { Cell, Mino } from "../core/mechanics";
import { GameReportStack } from "./report";
import { GameAttackState, LineClearAttackData } from "../core/attack";
import { GameStatsManager } from "./stats";
import { createFunction_DoesCurrentMinoCollide } from "./gameover";
import { GameSession, GameSessionConfig } from "./gamesession";
import { GameScheduledDamageState, GarbageGenerator, LinearDamageProvider, ScheduledDamage } from "../core/garbage";
import { CurrentMinoManager, HeldMinoManager, MinoQueueManager } from "../core/minomanager";


/** Manage multiple mino managers regarding the spawning of a mino. */
class MinoQueueAssistant {
    currentManager: CurrentMinoManager;
    queueManager: MinoQueueManager;
    heldManager: HeldMinoManager;
    constructor(gameContext: GameContext) {
        this.currentManager = gameContext.currentMinoManager;
        this.queueManager = gameContext.minoQueueManager;
        this.heldManager = gameContext.heldMinoManager;
    }

    /** @return tell if a new mino was spawned */
    spawnNextMinoWhenPlaced() {
        if (this.currentManager.isPlaced) {
            this.heldManager.resetLimit();
            this.currentManager.startNextMino(this.queueManager.takeNextMino());
            return true;
        }
        return false;
    }

    /** @return tell if a new mino was spawned */
    trySpawnHeldMino() {
        if (this.heldManager.canRecieveMino()) {
            const recievedMino = this.heldManager.recieveMino(this.currentManager.mino);
            this.currentManager.startNextMino(recievedMino ?? this.queueManager.takeNextMino());
            return true;
        }
        return false;
    }
}

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
    clearedRowList: Cell[][];
};

/** Update the game */
export class GameUpdator {

    private gameHighContext;

    //Given from Parameters
    private controlOrderProvider;
    private boardUpdateState;
    private damageProviderPerMino;
    private gameStatsManager;
    lineClearManager;
    gameAttackState;
    private garbageGenerator;
    private gravityPowerBase: number;

    //Instantiated
    private boardUpdater;
    private reporter;
    private doesCurrentMinoCollide;
    private minoQueueAssistant;

    //States
    allowGarbageNext: boolean;
    scheduledDamageState: GameScheduledDamageState;
    session!: GameSession;

    constructor(
        gameContext: GameContext,
        gameHighContext: GameHighContext,
        gravityPowerBase: number,
        { damageProviderPerMino }: { damageProviderPerMino: LinearDamageProvider }
    ) {
        this.controlOrderProvider = gameHighContext.controlOrderProvider;
        this.lineClearManager = gameHighContext.lineClearManager;
        this.gameAttackState = gameHighContext.gameAttackState;
        this.gameStatsManager = gameHighContext.gameStatsManager;
        this.garbageGenerator = gameHighContext.garbageGenerator;
        this.gravityPowerBase = gravityPowerBase;

        this.scheduledDamageState = gameHighContext.scheduledDamageState;

        this.damageProviderPerMino = damageProviderPerMino;

        this.minoQueueAssistant = new MinoQueueAssistant(gameContext);
        this.boardUpdateState = gameContext.boardUpdateState;
        this.allowGarbageNext = false;
        this.gameHighContext = gameHighContext;

        this.doesCurrentMinoCollide = createFunction_DoesCurrentMinoCollide(gameContext);
        this.boardUpdater = new BoardUpdater(gameContext);
        this.reporter = new GameReporter(gameContext.gameReportStack, gameHighContext.gameAttackState);
    }

    update(deltaTime: number): UpdateResult {
        
        this.lineClearManager.update(deltaTime);

        const simulatable = !this.lineClearManager.isDuringLineClear() && !this.session.isOver;
        const result = (simulatable && this.simulate(deltaTime)) || { placed: false };

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

            const lineCount = result.lineClearAttackData?.clearedRowList.length;
            if(lineCount) { window.log(`${lineCount} line(s) cleared`); }
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

    private simulate(deltaTime: number): UpdateResult | undefined {

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
            return;
        }

        const whenNewMinoSpawned = () => {
            this.boardUpdateState.startNewMino();
            this.controlOrderProvider.resetARR();
        }

        //Take new mino from queue
        if (this.minoQueueAssistant.spawnNextMinoWhenPlaced()) {
            whenNewMinoSpawned();
        }
        //immediately quit when the current mino collides
        if (this.doesCurrentMinoCollide()) {
            this.session.markAsOver();
            return;
        }

        //Take held mino
        const controlOrder = this.controlOrderProvider.provideControlOrder();
        const usedHold = controlOrder.get(ControlOrder.HOLD) && this.minoQueueAssistant.trySpawnHeldMino();
        if (usedHold) {
            whenNewMinoSpawned();
        }
        //immediately quit when the current mino collides
        if (this.doesCurrentMinoCollide()) {
            this.session.markAsOver();
            return;
        }

        //Finally update board
        const { boardUpdateDiff, lineClearAttackData, clearedRowList } = this.doNormalUpdate(deltaTime, controlOrder);

        //report
        this.reporter.addForEveryUpdate(boardUpdateDiff, lineClearAttackData, clearedRowList);

        //stats
        if(lineClearAttackData && lineClearAttackData.clearedRowList.length) {
            this.gameStatsManager.setNewLineClearAttackData(lineClearAttackData);
        }

        const placed = boardUpdateDiff.placed;
        return {
            placed, lineClearAttackData
        }
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

        //Garbage
        this.allowGarbageNext = boardUpdateDiff.placed;

        return { boardUpdateDiff, lineClearAttackData, clearedRowList };
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
        this.reporter.addScheduledDamage(scheduledDamage);
    }
}

class GameReporter {
    constructor(private reportStack: GameReportStack, private attackState: GameAttackState) {}

    addForEveryUpdate(diff: BoardUpdateDiff, lineClearAttackData: LineClearAttackData | undefined, rowList: NormalUpdateResult["clearedRowList"]) {
        if(lineClearAttackData) this.reportStack.add({ type: "LineClear", data: lineClearAttackData, rowList });

        const rotated = diff.appliedRotationAngle !== 0;
        if(rotated) this.reportStack.add({ type: "MinoRotate" });

        if(rotated && this.attackState.isLastMoveSpecial) this.reportStack.add({ type: "SpecialRotate" });

        if(!rotated && diff.horizontalMinoMove !== 0) this.reportStack.add({ "type": "MinoHorizontalMove" });

        if(!rotated && !diff.placedByHardDrop && diff.verticalMinoMove > 0) this.reportStack.add({ type: "MinoFall" });

        if(diff.placedByHardDrop) this.reportStack.add({ type: "HardDrop" });
    }

    addScheduledDamage(scheduledDamage: ScheduledDamage) {
        this.reportStack.add({ type: "ReceiveScheduledDamage", scheduledDamage });
    }
}
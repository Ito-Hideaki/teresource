import { GameAttackState } from "../core/attack";
import { Cell, CellBoard, Mino } from "../core/mechanics";
import { MinoQueueManager } from "../core/minomanager";
import { GameContext, GameHighContext } from "../infra/context";
import { ControlOrder, ControlOrderGateway } from "../controller/controlorder";
import { viteURLify } from "#util";
import * as TBP from "./core";
import { translateLocation } from "./translatemessage";
import { RouteSearcher } from "./search";
import { BotControlOrderProvider } from "./provider";
import { GameObserver } from "./observer";
import { BoardUpdateDiff } from "../controller/boardcontroller";

export type BotConfig = {
    type: "test1" | "test2";
    /** must be zero or positive integer */ interval: number;
};

interface TBPImpl {
    sendMessageObject: (message: any) => void,
    terminate: () => void,
    addListener: (listener: (message: TBP.BotMessage) => any) => void
};

const emptyImpl: TBPImpl = {
    sendMessageObject: (message: any) => {},
    terminate: () => {},
    addListener: (message: any) => {}
}

const WORKER_PATHS = {
    "test2": "cc2/worker.js"
};

class WorkerImpl implements TBPImpl {
    private worker;
    private listeners: ((message: TBP.BotMessage) => any)[] = [];
    private terminated = false;

    constructor(type: keyof typeof WORKER_PATHS) {
        const workerPath = WORKER_PATHS[type];
        if(!workerPath) throw "tbp worker path not found";
        this.worker = new Worker(viteURLify(workerPath), { type: "module" });
        this.worker.onmessage = e => {
            for(const listener of this.listeners) listener(JSON.parse(e.data));
        };
    }

    addListener (listener: (message: TBP.BotMessage) => any) {
        this.listeners.push(listener);
    }

    sendMessageObject (obj: any) {
        if(!this.terminated) this.worker.postMessage(JSON.stringify(obj));
    }

    terminate() {
        if(!this.terminated) {
            this.worker.terminate();
            this.terminated = true;
        }
    }
}

function minoChar(mino: Mino) {
    return mino.type.toUpperCase();
}

function cellChar(cell: Cell) {
    if(cell.isBlock) {
        return "G";
    } else {
        return null;
    }
}

class StartMessageCreator {
    private heldMinoManager;
    private minoQueueManager;
    private currentMinoManager;
    private cellBoard: CellBoard;
    private gameAttackState: GameAttackState;
    private visibleMinoQueueLength: number;

    constructor(context: GameContext, gameAttackState: GameAttackState, visibleMinoQueueLength: number) {
        this.heldMinoManager = context.heldMinoManager;
        this.minoQueueManager = context.minoQueueManager;
        this.currentMinoManager = context.currentMinoManager;
        this.cellBoard = context.cellBoard;
        this.gameAttackState = gameAttackState;
        this.visibleMinoQueueLength = visibleMinoQueueLength;
    }

    create() {
        const heldMino = this.heldMinoManager.getMino();
        const board = new Array(40).fill(0).map((_, i) => {
            const cellRow = this.cellBoard.table.at(-i-1);
            if(cellRow) {
                return new Array(10).fill(0).map((_, j) => {
                    const cell = cellRow.at(j);
                    return cell ? cellChar(cell) : null;
                });
            }
            return new Array(10).fill(null);
        });
        return {
            type: "start",
            hold: heldMino ? minoChar(heldMino) : null,
            queue: [minoChar(this.currentMinoManager.mino), ...this.minoQueueManager.minoQueue.slice(0, this.visibleMinoQueueLength).map((mino: Mino) => minoChar(mino))],
            combo: this.gameAttackState.combo,
            back_to_back: this.gameAttackState.B2B,
            board
        }
    }
}

function sendJson(json: string) {
    console.log(json);
}

export class TBPHandler {
    terminated: boolean;
    private isActive;
    private impl;
    private startMessageCreator;
    private routeSearcher;
    private board;
    private controlOrderProvider;
    private observer;
    private recievedGarbageSinceLastBoot = 0;

    constructor(impl: TBPImpl, controlOrderProvider: BotControlOrderProvider, gameContext: GameContext, gameHighContext: GameHighContext, controlOrderGateway: ControlOrderGateway) {
        const VISIBLE_MINO_QUEUE_LENGTH = 5;
        this.terminated = false;
        this.isActive = false;
        this.board = gameContext.cellBoard;
        this.impl = impl;
        this.impl.addListener(this.onMessage.bind(this));
        this.startMessageCreator = new StartMessageCreator(gameContext, gameHighContext.gameAttackState, VISIBLE_MINO_QUEUE_LENGTH);
        this.routeSearcher = new RouteSearcher(gameContext);
        this.controlOrderProvider = controlOrderProvider;
        this.observer = new GameObserver(gameContext, VISIBLE_MINO_QUEUE_LENGTH);

        gameContext.eventEmitter.addListener("garbage_to_board", this.onGarbage.bind(this));
    }

    update(placed: boolean) {
        const { newMinoQueue, newPiece } = this.observer.check(placed);
        if(this.isActive) {
            if(newMinoQueue.length) {
                for(const mino of newMinoQueue) this.impl.sendMessageObject({ "type" : "new_piece", "piece" : minoChar(mino) });
            }
            if(newPiece) this.impl.sendMessageObject({ "type" : "suggest" });
        }
    }

    onMessage(message: TBP.BotMessage) {
        switch(message.type) {
            case "info":
                this.impl.sendMessageObject({ type: "rules" });
                break;
            case "ready":
                this.isActive = true;
                this.start();
                break;
            case "suggestion":
                const move = message.moves[0];
                console.log(move.location);

                if(this.recievedGarbageSinceLastBoot > 0) {
                    this.start();
                } else {
                    this.impl.sendMessageObject({ "type" : "play", "move" : move });
                    const trsLocation = translateLocation(move.location, this.board);
                    const path = this.routeSearcher.search(trsLocation);
                    this.controlOrderProvider.addPath(path);
                }
                break;
        }
    }

    private start() {
        this.impl.sendMessageObject(this.startMessageCreator.create());
        this.recievedGarbageSinceLastBoot = 0;
        setTimeout(() => { this.impl.sendMessageObject({ "type" : "suggest" }); }, 100);
    }

    onGarbage(lines: number) {
        if(this.isActive) this.recievedGarbageSinceLastBoot += lines;
    }

    quit() {
        //terminate bot
        this.impl.terminate();
        this.terminated = true;
        this.isActive = false;
    }
}

function createImpl(type: BotConfig["type"]) {
    if(type == "test1") return emptyImpl;
    return new WorkerImpl(type);
}

export function createTBPHandler(config: BotConfig, gameContext: GameContext, gameHighContext: GameHighContext, controlOrderGateway: ControlOrderGateway) {
    const controlOrderProvider = new BotControlOrderProvider(gameContext, controlOrderGateway, config.interval);
    return new TBPHandler(createImpl(config.type), controlOrderProvider, gameContext, gameHighContext, controlOrderGateway);
};
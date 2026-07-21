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

export type BotConfig = { type: "test1" | "test2" };

type TBPImpl = {
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

function createWorkerImpl(type: keyof typeof WORKER_PATHS): TBPImpl {
    const workerPath = WORKER_PATHS[type];
    if(!workerPath) throw "tbp worker path not found";
    const worker = new Worker(viteURLify(workerPath), { type: "module" });
    const listeners: Array<(message: TBP.BotMessage) => any> = [];
    worker.onmessage = e => {
        for(const listener of listeners) listener(JSON.parse(e.data));
    };
    let terminated = false;
    return {
        addListener: function(listener: (message: TBP.BotMessage) => any) {
            listeners.push(listener);
        },
        terminate: function() {
            if(!terminated) {
                worker.terminate();
                terminated = true;
            }
        },
        sendMessageObject(obj: any) {
            if(!terminated) worker.postMessage(JSON.stringify(obj));
        }
    }
};

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

function createStartMessageCreator(gameContext: GameContext, gameAttackState: GameAttackState, visibleMinoQueueLength: number) {
    const { cellBoard, minoQueueManager, heldMinoManager, currentMinoManager } = gameContext;
    return function() {
        const heldMino = heldMinoManager.getMino();
        const board = new Array(40).fill(0).map((_, i) => {
        const cellRow = cellBoard.table.at(-i);
        if(cellRow) return new Array(10).fill(0).map((_, j) => {
                const cell = cellRow.at(j);
                if(cell) return cellChar(cell);
                else return null;
            });
            else return new Array(10).fill(null);
        });
        return {
            type: "start",
            hold: heldMino ? minoChar(heldMino) : null,
            queue: [minoChar(currentMinoManager.mino), ...minoQueueManager.minoQueue.slice(0, visibleMinoQueueLength).map(mino => minoChar(mino))],
            combo: gameAttackState.combo,
            back_to_back: gameAttackState.B2B,
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
    private createStartMessage;
    private routeSearcher;
    private board;
    private controlOrderProvider;
    private observer;

    constructor(impl: TBPImpl, gameContext: GameContext, gameHighContext: GameHighContext, controlOrderGateway: ControlOrderGateway) {
        const VISIBLE_MINO_QUEUE_LENGTH = 5;
        this.terminated = false;
        this.isActive = false;
        this.board = gameContext.cellBoard;
        this.impl = impl;
        this.impl.addListener(this.onMessage.bind(this));
        this.createStartMessage = createStartMessageCreator(gameContext, gameHighContext.gameAttackState, VISIBLE_MINO_QUEUE_LENGTH);
        this.routeSearcher = new RouteSearcher(gameContext);
        this.controlOrderProvider = new BotControlOrderProvider(gameContext, controlOrderGateway);
        this.observer = new GameObserver(gameContext, VISIBLE_MINO_QUEUE_LENGTH);
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
                this.impl.sendMessageObject(this.createStartMessage());
                this.isActive = true;
                setTimeout(() => { this.impl.sendMessageObject({ "type" : "suggest" }); }, 1000);
                break;
            case "suggestion":
                const move = message.moves[0];
                this.impl.sendMessageObject({ "type" : "play", "move" : move });
                const trsLocation = translateLocation(move.location, this.board);
                const path = this.routeSearcher.search(trsLocation);
                this.controlOrderProvider.addPath(path);
                break;
        }
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
    return createWorkerImpl(type);
}

export function createTBPHandler(config: BotConfig, gameContext: GameContext, gameHighContext: GameHighContext, controlOrderGateway: ControlOrderGateway) {
    return new TBPHandler(createImpl(config.type), gameContext, gameHighContext, controlOrderGateway);
};
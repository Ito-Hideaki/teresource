import { GameAttackState } from "../core/attack";
import { Cell, CellBoard, Mino } from "../core/mechanics";
import { MinoQueueManager } from "../core/minomanager";
import { GameContext, GameHighContext } from "../infra/context";
import { ControlOrder, ControlOrderProvider } from "../controller/controlorder";
import { viteURLify } from "#util";

export type BotConfig = { type: "test1" | "test2" };

type TBPImpl = {
    sendMessageObject: (message: any) => void,
    terminate: () => void,
    addListener: (message: any) => void
}

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
    const listeners: Array<(message: any) => any> = [];
    worker.onmessage = e => {
        for(const listener of listeners) listener(JSON.parse(e.data));
    };
    let terminated = false;
    return {
        addListener: function(listener: (message: any) => any) {
            listeners.push(listener);
        },
        terminate: function() {
            if(!terminated) {
                worker.terminate();
                terminated = true;
            }
        },
        sendMessageObject(obj: any) {
            if(terminated) throw "Error: worker has terminated";
            worker.postMessage(JSON.stringify(obj));
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

function createStartMessageCreator(gameContext: GameContext, gameAttackState: GameAttackState) {
    const { cellBoard, minoQueueManager, heldMinoManager } = gameContext;
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
            queue: minoQueueManager.minoQueue.map(mino => minoChar(mino)),
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
    private controlOrderProvider;
    private impl;

    constructor(impl: TBPImpl, controlOrderProvider: ControlOrderProvider) {
        this.terminated = false;
        this.controlOrderProvider = controlOrderProvider;
        this.impl = impl;
        this.impl.addListener(this.onMessage.bind(this));
    }

    onMessage(message: any) {

    }

    quit() {
        //terminate bot
        this.impl.terminate();
        this.terminated = true;
    }
}

function createImpl(type: BotConfig["type"]) {
    if(type == "test1") return emptyImpl;
    return createWorkerImpl(type);
}

export function createTBPHandler(config: BotConfig, gameContext: GameContext, gameHighContext: GameHighContext) {
    return new TBPHandler(createImpl(config.type), gameHighContext.controlOrderProvider);
};
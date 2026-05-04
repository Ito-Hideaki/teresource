import { GameAttackState } from "../core/attack";
import { Cell, CellBoard, Mino } from "../core/mechanics";
import { MinoQueueManager } from "../core/minomanager";
import { GameContext, GameHighContext } from "../infra/context";
import { ControlOrder } from "./controlorder";

/** @param {Mino} mino */
function minoChar(mino) {
    return mino.type.toUpperCase();
}

/** @param {Cell} cell */
function cellChar(cell) {
    if(cell.isBlock) {
        return "G";
    } else {
        return null;
    }
}

/**
 *  @param {GameContext} gameContext
 *  @param {GameAttackState} gameAttackState
 */
function createStartMessageCreator(gameContext, gameAttackState) {
    const { cellBoard, minoQueueManager, heldMinoManager } = gameContext;
    return function() {
        const heldMino = heldMinoManager.getMino();
        const board = new Array(40).fill().map((_, i) => {
        const cellRow = cellBoard.table.at(-i);
        if(cellRow) return new Array(10).fill().map((_, j) => {
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

function sendJson(json) {
    console.log(json);
}

/** @typedef {{ type: "test1" | "test2" }} BotConfig */

export class TBPHandler {

    /** @type { Phaser.Events.EventEmitter } */
    static devResponseEmitter;

    /** @param {BotConfig} botConfig @param {GameContext} gameContext @param {GameHighContext} gameHighContext */
    constructor(botConfig, gameContext, gameHighContext) {
        this.type = botConfig.type;
        this.terminated = false;
        this.responseEmitter = TBPHandler.devResponseEmitter;
        this.createStartMessage = createStartMessageCreator(gameContext, gameHighContext.gameAttackState);

        if(this.type === "test2") this.#session();
    }

    #waitForResponse(type) {
        return new Promise((res, rej) => {
            const callback = json => {
                const message = JSON.parse(json);
                if(message.type !== type) return;

                this.responseEmitter.off("response", callback);
                if(this.terminated) {
                    rej();
                } else {
                    res(message);
                }
            };
            this.responseEmitter.on("response", callback);
        });
    }

    async #session() {
        try {
            //launch CC

            await this.#waitForResponse("info");

            sendJson(JSON.stringify({ type: "rules" }));

            await this.#waitForResponse("ready");

            sendJson(JSON.stringify(this.createStartMessage()));

            while(true) {

                sendJson(JSON.stringify({ type: "suggest" }));

                const { moves } = await this.#waitForResponse("suggestion");

                sendJson(JSON.stringify({ type: "play", move: moves[0] }));
            }
        } catch(e) {
            //Terminate Bot Gracefully
            console.log("Bot terminated");
        }
    }

    quit() {
        this.terminated = true;
    }

    update() {
        switch(this.type) {
            case "test1":
                return new ControlOrder(ControlOrder.START_SOFT_DROP | ControlOrder.MOVE_RIGHT);
            case "test2":
                return new ControlOrder(ControlOrder.ROTATE_CLOCK_WISE);
        }
    }
}
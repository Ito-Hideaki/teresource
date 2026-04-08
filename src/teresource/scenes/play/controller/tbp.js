import { GameContext } from "../infra/context";
import { ControlOrder } from "./controlorder";

function sendJson(json) {
    console.log(json);
}

/** @typedef {{ type: "test1" | "test2" }} BotConfig */

export class TBPHandler {

    /** @type { Phaser.Events.EventEmitter } */
    static devResponseEmitter;

    /** @param {BotConfig} botConfig @param {GameContext} gameContext */
    constructor(botConfig, gameContext) {
        this.type = botConfig.type;
        this.responseEmitter = TBPHandler.devResponseEmitter;

        if(this.type === "test2") this.#session();
    }

    #waitForResponse(type) {
        return new Promise((res, rej) => {
            const callback = json => {
                const message = JSON.parse(json);
                if(message.type !== type) return;

                this.responseEmitter.off("response", callback);
                res(message);
            };
            this.responseEmitter.on("response", callback);
        });
    }

    async #session() {
        //launch CC

        await this.#waitForResponse("info");

        sendJson(JSON.stringify({ type: "rules" }));

        await this.#waitForResponse("ready");

        console.log("Bot is Ready!");
    }

    quit() {

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
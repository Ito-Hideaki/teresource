import { GameContext } from "../infra/context";
import { ControlOrder } from "./controlorder";

/** @typedef {{ type: "test1" | "test2" }} BotConfig */

export class TBPHandler {

    /** @param {BotConfig} botConfig @param {GameContext} gameContext */
    constructor(botConfig, gameContext) {
        this.type = botConfig.type;
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
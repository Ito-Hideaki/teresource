import { GameContext } from "../infra/context";
import { ControlOrder } from "./controlorder";

export class TBPHandler {

    /** @param {GameContext} gameContext */
    constructor(gameContext) {
    }

    update() {
        return new ControlOrder(ControlOrder.START_SOFT_DROP | ControlOrder.MOVE_RIGHT);
    }
}
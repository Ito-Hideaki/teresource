import { BoardUpdateDiff } from "../controller/boardcontroller";
import { ControlOrder, ControlOrderProviderConfig } from "../controller/controlorder";

export class BotControlOrderProvider {

    constructor() {

    }

    init(config: ControlOrderProviderConfig) {

    }

    advanceTime(deltaTime: number) {

    }

    provideControlOrder(): ControlOrder {
        return new ControlOrder(0);
    }

    receiveControlResult(controlDiff: BoardUpdateDiff) {

    }

    resetARR() {

    }
}
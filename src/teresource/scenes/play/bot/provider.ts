import { BoardUpdateDiff } from "../controller/boardcontroller";
import { ControlOrder, ControlOrderGateway } from "../controller/controlorder";
import { GameContext } from "../infra/context";
import { Path } from "./search";

export class BotControlOrderProvider {

    private pathQueue: Path[] = [];

    constructor(gameContext: GameContext, controlOrderGateway: ControlOrderGateway) {
        controlOrderGateway.setProvider(this);
    }

    addPath(path: Path) {
        this.pathQueue.push(path);
    }

    provideControlOrder() {
        return new ControlOrder(0);
    }

    advanceTime(deltaTime: number) {

    }

    receiveControlResult(diff: BoardUpdateDiff) {

    }

    resetARR() {

    }
}
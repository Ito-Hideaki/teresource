import { BoardUpdateDiff } from "../controller/boardcontroller";
import { ControlOrder, ControlOrderGateway } from "../controller/controlorder";
import { GameContext } from "../infra/context";
import { Node, Path } from "./search";

export class BotControlOrderProvider {

    private pathQueue: Path[] = [];
    private currentNode: Node | undefined;
    private currentMinoManager;

    constructor(gameContext: GameContext, controlOrderGateway: ControlOrderGateway) {
        controlOrderGateway.setProvider(this);
        this.currentMinoManager = gameContext.currentMinoManager;
    }

    addPath(path: Path) {
        this.pathQueue.push(path);
    }

    initCurrentNode() {
        this.currentNode = this.pathQueue[0].route.at(0) ?? this.pathQueue[0].goal;
        return this.currentNode;
    }

    provideControlOrder() {
        if(!this.pathQueue.length) return new ControlOrder(0);
        const node = this.currentNode ?? this.initCurrentNode();
        const firstNode = this.pathQueue[0].route.at(0) ?? this.pathQueue[0].goal;

        if(node === firstNode) {
            if(node.location.x !== this.currentMinoManager.column) {
                const isRight = (node.location.x - this.currentMinoManager.column) > 0;
                return new ControlOrder(isRight ? ControlOrder.MOVE_RIGHT : ControlOrder.MOVE_LEFT);
            }
        } else if(node.parent) {

        } else {
        }

        return new ControlOrder(0);
    }

    advanceTime(deltaTime: number) {

    }

    receiveControlResult(diff: BoardUpdateDiff) {

    }

    resetARR() {

    }
}
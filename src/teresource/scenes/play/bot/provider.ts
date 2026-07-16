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

    private place() {
        this.pathQueue.splice(0, 1);
        this.currentNode = undefined;
        return new ControlOrder(ControlOrder.HARD_DROP);
    }

    provideControlOrder() {
        if(!this.pathQueue.length) return new ControlOrder(0);

        const node = this.currentNode ?? this.initCurrentNode();
        if(node.location.type !== this.currentMinoManager.mino.type) return new ControlOrder(ControlOrder.HOLD);

        const firstNode = this.pathQueue[0].route.at(0) ?? this.pathQueue[0].goal;
        const rotationDiff = (node.location.rotation - this.currentMinoManager.mino.rotation + 360) % 360;
        if(node === firstNode) {
            if(rotationDiff) {
                return new ControlOrder(rotationDiff > 180 ? ControlOrder.ROTATE_COUNTER_CLOCK : ControlOrder.ROTATE_CLOCK_WISE);
            } else if(node.location.x !== this.currentMinoManager.column) {
                const isRight = (node.location.x - this.currentMinoManager.column) > 0;
                return new ControlOrder(isRight ? ControlOrder.MOVE_RIGHT : ControlOrder.MOVE_LEFT);
            } else {
                if(!node.parent) return this.place();
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
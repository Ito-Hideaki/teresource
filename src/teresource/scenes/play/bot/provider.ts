import { BoardUpdateDiff } from "../controller/boardcontroller";
import { ControlOrder, ControlOrderGateway } from "../controller/controlorder";
import { GameContext } from "../infra/context";
import { BotConfig } from "./handler";
import { BotOrder, Node, Path } from "./search";
import * as TRS from "./trscore";

class Counter {
    value = 0;
    constructor(private n: number) {}

    count() {
        this.value++;
        if(this.value == this.n) {
            this.value = 0;
            return true;
        } else return false;
    }
}

export class BotControlOrderProvider {

    private pathQueue: Path[] = [];
    private currentNode: Node | undefined;
    private currentMinoManager;
    private reachedFirstNode = false;
    private intervalCounter;

    constructor(gameContext: GameContext, controlOrderGateway: ControlOrderGateway, interval: number) {
        controlOrderGateway.setProvider(this);
        this.currentMinoManager = gameContext.currentMinoManager;
        this.intervalCounter = new Counter(interval+1);
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
        this.reachedFirstNode = false;
        return new ControlOrder(ControlOrder.HARD_DROP);
    }

    private isOnLocation(location: TRS.Location) {
        return this.currentMinoManager.row === location.y && this.currentMinoManager.column === location.x && this.currentMinoManager.mino.rotation === location.rotation;
    }

    private provide_reachSkyNode(node: Node) {
        const rotationDiff = (node.location.rotation - this.currentMinoManager.mino.rotation + 360) % 360;
        if(rotationDiff) {
            return new ControlOrder(rotationDiff > 180 ? ControlOrder.ROTATE_COUNTER_CLOCK : ControlOrder.ROTATE_CLOCK_WISE);
        } else if(node.location.x !== this.currentMinoManager.column) {
            const isRight = (node.location.x - this.currentMinoManager.column) > 0;
            return new ControlOrder(isRight ? ControlOrder.MOVE_RIGHT : ControlOrder.MOVE_LEFT);
        } else if(!node.parent) return this.place();
        else if (node.location.y !== this.currentMinoManager.row) return new ControlOrder(ControlOrder.START_SOFT_DROP);

        throw "already reached sky node";
    }

    provideControlOrder(): ControlOrder {
        if(this.intervalCounter.count()) {
            const order = this.provideControlOrderInner();
            if(!order.get(ControlOrder.START_SOFT_DROP)) order.setTrue(ControlOrder.STOP_SOFT_DROP);
            return order;
        } else return new ControlOrder(0);
    }

    private provideControlOrderInner(): ControlOrder {
        if(!this.pathQueue.length) return new ControlOrder(0);

        //hold
        const node = this.currentNode ?? this.initCurrentNode();
        if(node.location.type !== this.currentMinoManager.mino.type) return new ControlOrder(ControlOrder.HOLD);

        //sky
        const firstNode = this.pathQueue[0].route.at(0) ?? this.pathQueue[0].goal;
        this.reachedFirstNode ||= this.isOnLocation(firstNode.location);
        if(!this.reachedFirstNode) return this.provide_reachSkyNode(firstNode);

        //move to an unreached node
        if (node.parent && this.isOnLocation(node.parent.location)) {
            this.currentNode = node.parent;
            return this.provideControlOrderInner();
        }

        //underground
        if(node.parent) {
            switch (node.controlToParent) {
                case BotOrder.ROTATE_CLOCK_WISE: return new ControlOrder(ControlOrder.ROTATE_CLOCK_WISE);
                case BotOrder.ROTATE_COUNTER_CLOCK: return new ControlOrder(ControlOrder.ROTATE_COUNTER_CLOCK);
                default: return new ControlOrder(0);
            }
        }

        //hard drop
        return this.place();
    }

    advanceTime(deltaTime: number) {

    }

    receiveControlResult(diff: BoardUpdateDiff) {

    }

    resetARR() {

    }
}
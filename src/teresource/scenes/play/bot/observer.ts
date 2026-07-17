import { Mino } from "../core/mechanics";
import { GameContext } from "../infra/context";

const VISIBLE_MINO_QUEUE_LENGTH = 5;

export class GameObserver {
    private minoQueue;
    private lastMinoQueue: Mino[] = [];
    constructor(gameContext: GameContext) {
        this.minoQueue = gameContext.minoQueueManager.minoQueue;
    }

    private checkMinoQueue() {
        let usedMinoNum = 0;
        while(this.lastMinoQueue.length && this.minoQueue[0] !== this.lastMinoQueue[usedMinoNum]) usedMinoNum++;
        const newMinoQueue = this.minoQueue.slice(this.lastMinoQueue.length - usedMinoNum, this.visibleMinoQueueLength);
        this.lastMinoQueue.push(...newMinoQueue);
        return newMinoQueue;
    }

    check() {
        return { newMinoQueue: this.checkMinoQueue() };
    }
}
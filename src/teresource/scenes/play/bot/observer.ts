import { Mino } from "../core/mechanics";
import { GameContext } from "../infra/context";

export class GameObserver {
    private minoQueue;
    private lastMinoQueue: Mino[] = [];
    private readonly visibleMinoQueueLength;
    constructor(gameContext: GameContext, visibleMinoQueueLength: number) {
        this.minoQueue = gameContext.minoQueueManager.minoQueue;
        this.visibleMinoQueueLength = visibleMinoQueueLength;
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
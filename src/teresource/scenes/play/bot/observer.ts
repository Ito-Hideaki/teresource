import { BoardUpdateDiff } from "../controller/boardcontroller";
import { Mino } from "../core/mechanics";
import { GameContext } from "../infra/context";

export class GameObserver {
    private minoQueue;
    private lastMinoQueue: Mino[] = [];
    private readonly visibleMinoQueueLength;
    private placed: boolean = false;

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

    check(placed: boolean) {
        this.placed ||= placed;
        const newMinoQueue = this.checkMinoQueue();

        const newPiece = newMinoQueue.length && this.placed;
        if(newPiece) this.placed = false;

        return { newMinoQueue, newPiece };
    }
}
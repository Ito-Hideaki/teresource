import { Board, BoardSize } from "./mechanics";
import { CurrentMinoManager, MinoQueueManager } from "./minomanager";
import { BoardControlState } from "./boardcontroller";

/** @param {{}} source @return GameContext */
export class GameContext {
    /** @type BoardSize */
    boardSize
    /** @type Board */
    board
    /** @type {CurrentMinoManager} */
    currentMinoManager
    /** @type {MinoQueueManager} */
    minoQueueManager
    /** @type {BoardControlState} */
    boardControlState

    constructor(source) {
        const keys = [
            "board",
            "boardSize",
            "currentMinoManager",
            "minoQueueManager",
            "boardControlState"
        ];
        for (let key of keys) {
            this[key] = source[key];
        }
    }
}
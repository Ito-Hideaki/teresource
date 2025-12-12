import { Board } from "./mechanics";
import { CurrentMinoManager, MinoQueueManager } from "./minomanager";
import { BoardControlState } from "./boardcontroller";

/** @param {{}} source @return GameContext */
export class GameContext {
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
            "currentMinoManager",
            "minoQueueManager",
            "boardControlState"
        ];
        for (let key of keys) {
            this[key] = source[key];
        }
    }
}
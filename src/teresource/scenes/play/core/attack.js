import { BoardUpdateDiff } from "../controller/boardcontroller";

export class GameAttackState {
    /** @type {boolean} */ isLastMoveSpecial = false;
    /** @type {number} */ combo = -1;
    /** @param {BoardUpdateDiff} boardUpdateDiff */
    update(boardUpdateDiff, clearedRowLength) {

    }
}
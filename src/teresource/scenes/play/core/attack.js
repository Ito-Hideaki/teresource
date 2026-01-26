import { BoardUpdateDiff } from "../controller/boardcontroller";
import { GameContext } from "../infra/context";
import { MINO_DATA_INDEX } from "./coredata";
import { CellBoard } from "./mechanics";
import { CurrentMinoManager } from "./minomanager";

const NONE = 0;
const SPECIAL = 1;
const MINI = 2;

/** @param {CellBoard} cellBoard @param {CurrentMinoManager} currentMinoManager */
function detectTSpecial(cellBoard, currentMinoManager) {
    if(currentMinoManager.mino.type !== "t") return NONE;

    //cellPos of the center of the T mino
    const minoRow = currentMinoManager.row, minoColumn = currentMinoManager.column;
    let cornerBlockCount = 0;
    if(cellBoard.getCell(minoRow - 1, minoColumn - 1).isBlock) cornerBlockCount++;
    if(cellBoard.getCell(minoRow + 1, minoColumn - 1).isBlock) cornerBlockCount++;
    if(cellBoard.getCell(minoRow - 1, minoColumn + 1).isBlock) cornerBlockCount++;
    if(cellBoard.getCell(minoRow + 1, minoColumn + 1).isBlock) cornerBlockCount++;

    if(cornerBlockCount >= 3) return SPECIAL;
    else return NONE;
}

/** @param {CellBoard} cellBoard @param {CurrentMinoManager} currentMinoManager */
function detectTMini(cellBoard, currentMinoManager) {
    //cellPos of the center of the T mino
    const minoRow = currentMinoManager.row, minoColumn = currentMinoManager.column;
    if(cellBoard.isCellPosOutOfTable(minoRow - 1, minoColumn + 1)) return MINI;
    if(cellBoard.isCellPosOutOfTable(minoRow + 1, minoColumn + 1)) return MINI;
    return NONE;
}

/** Recieve BoardUpdateDiff every frame and manage attack-related state of the game */
export class GameAttackState {
    /** @type {boolean} */ isLastMoveSpecial;
    /** @type {number} */ combo;

    /** @param {GameContext} context */
    constructor(context) {
        this.cellBoard = context.cellBoard;
        this.currentMinoManager = context.currentMinoManager;
    }

    /** @param {BoardUpdateDiff} boardUpdateDiff @param {number} clearedRowLength*/
    update(boardUpdateDiff, clearedRowLength) {
        const moveOccured = Boolean(boardUpdateDiff.appliedRotationAngle || boardUpdateDiff.horizontalMinoMove);
        if(moveOccured) {
            if(detectTSpecial(this.cellBoard, this.currentMinoManager) === SPECIAL) {
                this.isLastMoveSpecial = true;
                window.log("Special!");
            } else {
                this.isLastMoveSpecial = false;
            }
        }
    }
}
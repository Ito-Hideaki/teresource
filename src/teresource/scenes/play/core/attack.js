import { BoardUpdateDiff } from "../controller/boardcontroller";
import { GameContext } from "../infra/context";
import { MINO_DATA_INDEX } from "./coredata";
import { CellBoard } from "./mechanics";
import { CurrentMinoManager } from "./minomanager";

/** @param { CellBoard } cellBoard */
function detectAllClear(cellBoard) {
    for(let row = 0; row < cellBoard.rowCount; row++) {
        for(let column = 0; column < cellBoard.columnCount; column++) {
            if(cellBoard.getCell(row, column).isBlock) return false;
        }
    }
    return true;
}

/** @param {CellBoard} cellBoard @param {CurrentMinoManager} currentMinoManager */
function detectTSpecial(cellBoard, currentMinoManager) {

    function isCellBlock(row, column) {
        return cellBoard.isCellPosOutOfTable(row, column) || cellBoard.getCell(row, column).isBlock;
    }

    if(currentMinoManager.mino.type !== "t") return false;

    //cellPos of the center of the T mino
    const minoRow = currentMinoManager.row, minoColumn = currentMinoManager.column;
    let cornerBlockCount = 0;
    if(isCellBlock(minoRow - 1, minoColumn - 1)) cornerBlockCount++;
    if(isCellBlock(minoRow - 1, minoColumn + 1)) cornerBlockCount++;
    if(isCellBlock(minoRow + 1, minoColumn - 1)) cornerBlockCount++;
    if(isCellBlock(minoRow + 1, minoColumn + 1)) cornerBlockCount++;

    return cornerBlockCount >= 3;
}

/** @param {CellBoard} cellBoard @param {CurrentMinoManager} currentMinoManager */
function detectTMini(cellBoard, currentMinoManager) {
    if(currentMinoManager.mino.type !== "t") return false;
    //cellPos of the center of the T mino
    const minoRow = currentMinoManager.row, minoColumn = currentMinoManager.column;
    if(cellBoard.isCellPosOutOfTable(minoRow - 1, minoColumn + 1)) return true;
    if(cellBoard.isCellPosOutOfTable(minoRow + 1, minoColumn + 1)) return true;
    return false;
}

export class LineClearAttackData {
    /** @type {number[]} */ clearedRowList;
    /** @type {number} */ combo;
    /** @type {boolean} */ isSpecial;
    /** @type {boolean} */ isMini;
    /** @type {boolean} */ isAllClear;
    /** @type {boolean} */ B2B;

    /** @param {LineClearAttackData} data */
    constructor(data = {}) {
        Object.assign(this, data);
    }
}

/** Recieve BoardUpdateDiff every frame and manage attack-related state of the game */
export class GameAttackState {
    /** @type {boolean} */ isLastMoveSpecial = false;
    /** @type {boolean} */ isLastMoveMini = false;
    /** @type {number} */ combo = 0;
    /** @type {boolean} */ preCombo = false;
    /** @type {boolean} */ preB2B = false;
    /** @type {boolean} */ B2B = false;

    /** @param {GameContext} context */
    constructor(context) {
        this.cellBoard = context.cellBoard;
        this.currentMinoManager = context.currentMinoManager;
    }

    /** @param {BoardUpdateDiff} boardUpdateDiff @param {number} clearedRowLength*/
    update(boardUpdateDiff, clearedRowLength) {
        //update isLastMoveSpecial
        const rotateOccured = Boolean(boardUpdateDiff.appliedRotationAngle);
        const moveOccured = Boolean(boardUpdateDiff.horizontalMinoMove);
        if(rotateOccured) {
            this.isLastMoveSpecial = detectTSpecial(this.cellBoard, this.currentMinoManager);
            this.isLastMoveMini = detectTMini(this.cellBoard, this.currentMinoManager);
            if(this.isLastMoveSpecial) window.log("Special!");
        } else if(moveOccured) {
            this.isLastMoveSpecial = false;
            this.isLastMoveMini = false;
        }

        if(boardUpdateDiff.placedByHardDrop || boardUpdateDiff.placedByLockDown) {
            if(clearedRowLength) {
                //update combo
                if(this.preCombo) {
                    this.combo++;
                } else {
                    this.preCombo = true;
                }
                //update back to back
                if((clearedRowLength === 4) || this.isLastMoveSpecial) {
                    if(this.preB2B) { this.B2B = true; window.log("B2B");}
                    else this.preB2B = true;
                } else {
                    this.preB2B = false;
                    this.B2B = false;
                }
            } else {
                //update combo
                this.preCombo = false;
                this.combo = 0;
            }
        }
    }

    /** @param {number} clearedRowList */
    createLineClearAttackData(clearedRowList) {
        if(detectAllClear(this.cellBoard)) window.log("All Clear!");
        return new LineClearAttackData({
            clearedRowList,
            combo: this.combo,
            isSpecial: this.isLastMoveSpecial,
            isMini: this.isLastMoveMini,
            isAllClear: detectAllClear(this.cellBoard),
            B2B: this.B2B
        });
    }
}
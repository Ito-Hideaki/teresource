import { GameContext } from "../infra/context";
import { Cell, CellBoard } from "./mechanics";

/** @type {{ time_s: number }[]} */
const LINE_CLEAR_SETTINGS_LIST = [
    { time_s: 0 },
    { time_s: 0.24 }, //single
    { time_s: 0.32 }, //double
    { time_s: 0.40 }, //triple
    { time_s: 0.48 } //quadraple
]

export class LineClearManager {

    /** @type {number} */
    #lineClearLastTime_s = 0;
    /** @type {CellBoard} */
    #cellBoard;
    /** @type {number[]} */
    #currentRowToClearList;

    /** @param {GameContext} context */
    constructor(context) {
        this.#cellBoard = context.cellBoard;
    }

    findRowToClearList() {
        const board = this.#cellBoard;
        const rowToClearList = [];
        for (let row = 0; row < board.rowCount; row++) {
            let thisRowValid = true;
            for (let column = 0; column < board.columnCount; column++) {
                const cell = board.getCell(row, column);
                if (!cell.isBlock) thisRowValid = false; continue;
            }
            if (thisRowValid) rowToClearList.push(row);
        }

        return rowToClearList;
    }

    /** clear filled row, then set currentRowToClearList with new one @param {number[]} rowToClearList @return {Cell[][]} rowList */
    startClear(rowToClearList) {
        if(rowToClearList.length <= 0) return;

        this.#currentRowToClearList = rowToClearList;

        const rowList = [];
        const board = this.#cellBoard;
        //clear row
        for (let row = 0; row < board.rowCount; row++) {
            if (rowToClearList.includes(row)) {
                rowList.push(board.table[row]);
                board.table[row] = board.createRow();
            }
        }

        this.#lineClearLastTime_s = LINE_CLEAR_SETTINGS_LIST[rowToClearList.length].time_s;
        return rowList;
    }

    /** drop cleared row, then set currentRowToClearList empty. @param {number[]} rowToClearList */
    endClear(rowToClearList) {
        const board = this.#cellBoard;
        //drop row from bottom to top and generate new row;
        let clearedRowNum = 0;
        for (let row = board.rowCount - 1; row >= 0; row--) {
            while (rowToClearList.includes(row - clearedRowNum)) clearedRowNum++;
            const rowToCopyFrom = row - clearedRowNum;
            board.table[row] = rowToCopyFrom >= 0
                ? board.table[rowToCopyFrom]
                : board.createRow();
        }

        this.#currentRowToClearList = [];
    }

    isDuringLineClear() {
        return this.#lineClearLastTime_s >= 1 / 120;
    }

    update(delta_s) {
        if(this.isDuringLineClear()) {
            this.#lineClearLastTime_s -= delta_s;
            if(!this.isDuringLineClear()) { //when line clear ends in this frame
                this.endClear(this.#currentRowToClearList);
            }
        } else {
            this.#lineClearLastTime_s = 0;
        }
    }
}
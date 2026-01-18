import { LineClearReport, GameReportStack } from "../controller/report";
import { GameContext } from "../infra/context";
import { CellBoard } from "./mechanics";


/** @param {number} num number of cleared rows @return {string} */
export function getLineClearCodeFromNum(num) {
    const value =[undefined, "ichi", "ni", "san", "yon"][num];
    if(typeof value !== "string") throw "nanka okashii";
    return value;
}

/** @type {Object.<string, { time_s: number }>} */
const LINE_CLEAR_SETTINGS_MAP = {
    "ichi": { time_s: 0.3 },
    "ni"  : { time_s: 0.36 },
    "san" : { time_s: 0.42 },
    "yon" : { time_s: 0.48 }
}

export class LineClearManager {

    /** @type {number} */
    #lineClearLastTime_s = 0;
    /** @type {CellBoard} */
    #cellBoard;
    /** @type {number[]} */
    #currentRowToClearList;
    /** @type {GameReportStack} */
    #gameReportStack;

    /** @param {GameContext} context */
    constructor(context) {
        this.#cellBoard = context.cellBoard;
        this.#gameReportStack = context.gameReportStack;
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

    /** clear filled row, then set currentRowToClearList with new one @param {number[]} rowToClearList */
    startClear(rowToClearList) {
        if(rowToClearList.length <= 0) return;

        this.#currentRowToClearList = rowToClearList;

        const board = this.#cellBoard;
        //clear row
        for (let row = 0; row < board.rowCount; row++) {
            if (rowToClearList.includes(row)) {
                board.table[row] = board.createRow();
            }
        }

        const code = getLineClearCodeFromNum(rowToClearList.length);
        this.#lineClearLastTime_s = LINE_CLEAR_SETTINGS_MAP[code].time_s;
        const report = new LineClearReport({ rowToClearList, code });
        this.#gameReportStack.add(report);
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
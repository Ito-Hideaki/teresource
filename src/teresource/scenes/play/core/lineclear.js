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
    "ni"  : { time_s: 0.37 },
    "san" : { time_s: 0.44 },
    "yon" : { time_s: 0.51 }
}

export class LineClearManager {

    /** @type {number} */
    #lineClearLastTime_s = 0;
    /** @type {CellBoard} */
    #cellBoard;

    /** @param {GameContext} context */
    constructor(context) {
        this.#cellBoard = context.cellBoard;
    }

    findRowToClear() {
        const board = this.#cellBoard;
        const rowToClear = [];
        for (let row = 0; row < board.rowCount; row++) {
            let thisRowValid = true;
            for (let column = 0; column < board.columnCount; column++) {
                const cell = board.getCell(row, column);
                if (!cell.isBlock) thisRowValid = false; continue;
            }
            if (thisRowValid) rowToClear.push(row);
        }

        return rowToClear;
    }

    /** @param {number[]} rowToClear */
    startClear(rowToClear) {
        if(rowToClear.length <= 0) return;

        const board = this.#cellBoard;
        //clear/drop row from bottom to top
        let nextRow = board.rowCount - 1;
        for (let row = board.rowCount - 1; row >= 0; row--) {
            if (rowToClear.includes(row)) continue;
            board.table[nextRow] = board.table[row];
            nextRow--;
        }
        //generate new row
        for (; nextRow >= 0; nextRow--) {
            board.table[nextRow] = board.createRow();
        }

        const code = getLineClearCodeFromNum(rowToClear.length);
        this.#lineClearLastTime_s = LINE_CLEAR_SETTINGS_MAP[code].time_s;
    }

    isDuringLineClear() {
        return this.#lineClearLastTime_s < 1 / 120;
    }

    update(delta_s) {
        this.#lineClearLastTime_s = Math.max(0, this.#lineClearLastTime_s - delta_s);
    }
}
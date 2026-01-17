import { GameContext } from "../infra/context";
import { CellBoard } from "./mechanics";

export const LINE_CLEAR_CODES = [
    "ichi",
    "ni",
    "san",
    "yon"
]

export class LineClearManager {
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
    }

    update() {
    }
}
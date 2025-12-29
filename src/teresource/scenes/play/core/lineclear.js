import { GameContext } from "../infra/context";
import { CellBoard } from "./mechanics";

export class LineClearManager {
    /** @type {CellBoard} */
    #cellBoard;
    /** @param {GameContext} context */
    constructor(context) {
        this.#cellBoard = context.cellBoard;
    }

    update() {
        //This function very much depends to Board
        const board = this.#cellBoard;
        const rowToClear = [];
        //find row to clear
        for(let row = 0; row < board.rowCount; row++) {
            let thisRowValid = true;
            for(let column = 0; column < board.columnCount; column++) {
                const cell = board.getCell(row, column);
                if(!cell.isBlock) thisRowValid = false; continue;
            }
            if(thisRowValid) rowToClear.push(row);
        }

        //clear/drop row from bottom to top
        let nextRow = board.rowCount - 1;
        for(let row = board.rowCount - 1; row >= 0; row--) {
            if(rowToClear.includes(row)) continue;
            board.table[nextRow] = board.table[row];
            nextRow--;
        }
        //generate new row
        for(; nextRow >= 0; nextRow--) {
            board.table[nextRow] = board.createRow();
        }
    }
}
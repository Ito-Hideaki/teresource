import { cellPosRotate4Way } from "#util";
import { MINO_DATA_INDEX } from "./coredata";

/**
 * @typedef { {size:number, map:number[][], origin:{x:number,y:number}} } MinoShape
 */


/** Contains mino's color, shape and rotation. */
export class Mino {

    static #rotatePos = function(shape, row, column, rotation) {
        const rot4way = ((rotation / 90) % 4 + 4) % 4;
        const offset = (shape.size -  1)/ 2;
        const rotatedCoordinate = cellPosRotate4Way(column - offset, row - offset, rot4way);
        rotatedCoordinate.column += offset;
        rotatedCoordinate.row += offset;
        return rotatedCoordinate;
    }

    /** @param {MinoShape} shape @param {number} rotation 実数、オイラー角 @return {MinoShape}*/
    static #rotateShape = function(shape, rotation) {
        const copied = structuredClone(shape);
        shape.map.forEach((arr, row) => arr.forEach((val, column) => {
            const rotatedCoordinate = Mino.#rotatePos(shape, row, column, rotation);
            copied.map[rotatedCoordinate.row][rotatedCoordinate.column] = val;
        }));
        return copied;
    }

    #type;
    /** 0, 90, 180, 270 clockwise @type number */
    #rotation;
    /** @type { MinoShape } */
    #shape;

    /**
     * @param {string} type
     * @param {number} rotation 0, 90, 180, 270 clockwise
     * */
    constructor(type, rotation = 0) {
        this.#type = type;
        this.#rotation = rotation;
        this.#shape = Mino.#rotateShape(MINO_DATA_INDEX[type].shape, rotation);
    }

    /** @return {Mino} duplicated mino */
    duplicate(type = undefined, rotation = undefined) {
        return new Mino(type ?? this.#type, rotation ?? this.#rotation);
    }

    get type() {
        return this.#type;
    }

    /**
     * @return { MinoShape }
     * */
    get shape() {
        return this.#shape;
    }

    /** @return {number} 0, 90, 180, 270 clockwise */
    get rotation() {
        return this.#rotation;
    }

    /** Returns mino duplicated then rotated
     * @param {number} rotation 0, 90, 180, 270 clockwise
     */
    copyRotated(rotation) {
        return this.duplicate(undefined, (this.#rotation + rotation)%360);
    }

    /**
     * @param {{
     *     isActive: boolean
     * }} $
     * @return {{table: Cell[][], topLeft: { column: number, row: number } }} topLeft: relative topleft cell position of the table*/
    convertToTable($ = {}) {
        const table = [];
        this.#shape.map.forEach((array, row) => {
            const tableRow = [];
            array.forEach((value, column) => {
                const rot0cellPos = Mino.#rotatePos(this.#shape, row, column, -this.#rotation);
                const cell = new Cell(
                    value,
                    MINO_DATA_INDEX[this.#type].color,
                    {
                        isActive: $.isActive,
                        rotation: this.#rotation,
                        partColumn: rot0cellPos.column,
                        partRow: rot0cellPos.row
                    }
                );
                tableRow.push(cell);
            });
            table.push(tableRow);
        });
        const topLeft = {};
        topLeft.row = -this.#shape.origin.y;
        topLeft.column = -this.#shape.origin.x;
        return { table, topLeft };
    }
}

/** Represents each cell that consists board */
export class Cell {

    #isBlock;
    #isActive;
    #color;
    /** 0, 90, 180 or 270 @type {number} */ #rotation;
    /** located row of this cell in the mino table (rotation = 0) */ #partRow;
    /** located column of ths cell in the mino table (rotation = 0) */ #partColumn;

    /**
     * @param {Boolean} isBlock
     * @param {string} color
     * @param {{
     * isActive?: boolean,
     * rotation?: number,
     * partRow? : number,
     * partColumn? : number
     * }} $
     */
    constructor(isBlock, color = "red", $ = {}) {
        this.#isBlock = isBlock;
        this.#isActive = $.isActive ?? false;
        this.#rotation = $.rotation ?? 0;
        this.#partRow = $.partRow;
        this.#partColumn = $.partColumn;
        this.#color = color;

        this.#validate();
    }

    #validate() {
        if(![0, 90, 180, 270].includes(this.#rotation)) throw "Error rotation value is invalid";
    }

    get isBlock() { return this.#isBlock }
    get isActive() { return this.#isActive }
    get color() { return this.#color }
    get rotation() { return this.#rotation }
    get partRow() { return this.#partRow }
    get partColumn() { return this.#partColumn }
}


/** 
 * @param {Cell} boardCell
 * @param {Cell} minoCell
 */
function getCompositionResultCell(boardCell, minoCell) {
    if (!minoCell.isBlock) return boardCell;
    return minoCell;
}


/** Represents board size in cell, rowCount and columnCount */
export class BoardSize {
    #rowCount;
    #columnCount;
    get rowCount() { return this.#rowCount };
    get columnCount() { return this.#columnCount };
    constructor(rowCount, columnCount) {
        this.#rowCount = rowCount;
        this.#columnCount = columnCount;
    }
}


export class Board {
    /** @type {any[][]} */
    table;
    /** @type {Function} */
    elementFactory;

    get rowCount() { return this.table.length; }
    get columnCount() { return this.table[0].length; }

    /**
     * @param { BoardSize } boardSize used to create table
     * @param { Function } elementFactory
    */
    constructor(boardSize, elementFactory) {
        this.elementFactory = elementFactory;
        const size = boardSize ?? new BoardSize();
        this.table = new Array(size.rowCount).fill().map(() => {
            return this.createRow(size.columnCount)
        });
    }

    createRow(columnCount = this.columnCount) {
        return new Array(columnCount).fill().map(this.elementFactory);
    }

    isCellPosOutOfTable(row, column) {
        return (row < 0
            || this.rowCount <= row
            || column < 0
            || this.columnCount <= column);
    }

    /** Returns duplicated table. @return { any[][] }  */
    duplicateTable() {
        const table = [];
        this.table.forEach((array, row) => {
            const newArray = [];
            array.forEach((value, column) => {
                newArray.push(value);
            })
            table.push(newArray);
        })
        return table;
    }

    /** @return {Board} */
    duplicate() {
        const b = new Board(new BoardSize(this.rowCount, this.columnCount), () => false);
        b.table = this.duplicateTable();
        return b;
    }
}


/** Place where the all cells exists. Playfield. Does mino composition and collision verdict */
export class CellBoard extends Board {

    /**
     * @param { BoardSize } boardSize used to create table
    */
    constructor(boardSize) {
        super(boardSize, () => new Cell(false));
    }


    /** Composite given mino table to its table.
     * @param {Cell[][]} minoTable cell table to composite
     * @param {number} row table topLeft cellPos
     * @param {number} column table topLeft cellPos
     * @return {CellBoard} this
     */
    compositeMinoTable(minoTable, row, column) {
        minoTable.forEach((array, sRow) => {
            array.forEach((cell, sColumn) => {
                const cellRow = row + sRow;
                const cellColumn = column + sColumn;
                if (this.isCellPosOutOfTable(cellRow, cellColumn)) return;

                const resultCell = getCompositionResultCell(this.table[cellRow][cellColumn], cell);
                this.table[cellRow][cellColumn] = resultCell;
            });
        });
        return this;
    }


    /**
     * @param {number} row @param {number} column @return {Cell}
    */
    getCell(row, column) {
        if (this.isCellPosOutOfTable(row, column)) throw "Given cellPos is out of the range of the board";
        return this.table[row][column];
    }

    /** Returns if the given mino collides width walls or the board.
     * @param {Mino} mino
     * @param {number} row mino cellPos row
     * @param {number} column mino cellPos column
     * @return {boolean}
     */
    doesMinoCollides(mino, row, column) {
        let collides = false;
        mino.shape.map.forEach((array, sRow) => {
            array.forEach((value, sColumn) => {
                if (!value) return;
                const cellRow = row + sRow - mino.shape.origin.y;
                const cellColumn = column + sColumn - mino.shape.origin.x;
                if (
                    this.isCellPosOutOfTable(cellRow, cellColumn)
                    || this.table[cellRow][cellColumn].isBlock
                ) {
                    collides = true;
                }
            });
        });
        return collides;
    }


    /** Returns the possible horizontal movement in given range, not colliding with any walls or blocks
     * @param {number} columnChange columnの変位
     * @param {Mino} mino
     * @param {number} row
     * @param {number} column
     * @return {number} movement amount */
    tryMoveMinoHorizontally(columnChange, mino, row, column) {
        if (columnChange == 0) return 0;
        columnChange = Math.floor(columnChange);
        const direction = columnChange > 0 ? 1 : -1;

        let columnMoved = 0;
        while (columnChange != columnMoved) {
            if (this.doesMinoCollides(
                mino,
                row,
                column + columnMoved + direction)
            ) break;
            columnMoved += direction;
        }

        return columnMoved;
    }


    /** Returns the possible vertical movement in given range, not colliding with any walls or blocks
 * @param {number} rowChange rowの変位
 * @param {Mino} mino
 * @param {number} row
 * @param {number} column
 * @return {number} movement amount */
    tryMoveMinoVertically(rowChange, mino, row, column) {
        if (rowChange == 0) return 0;
        rowChange = Math.floor(rowChange);
        const direction = rowChange > 0 ? 1 : -1;

        let rowMoved = 0;
        while (rowChange != rowMoved) {
            if (this.doesMinoCollides(
                mino,
                row + rowMoved + direction,
                column)
            ) break;
            rowMoved += direction;
        }

        return rowMoved;
    }

    /** @return {CellBoard} */
    duplicate() {
        const b = new CellBoard(new BoardSize(this.rowCount, this.columnCount));
        b.table = this.duplicateTable();
        return b;
    }
}
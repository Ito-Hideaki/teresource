import { Cell, CellBoard } from "./mechanics";

/** @param {number} holeColumn @param {number} columnCount */
function generateGarbageRow(holeColumn, columnCount) {
    const emptyRow = new Array(columnCount).fill();
    return emptyRow.map((_, ci) => {
        if(ci === holeColumn) return new Cell(false);
        else return new Cell(true, "grey");
    });
}

/** @param {number} holeColumn @param {number} columnCount  @param {number} length */
function generateRandomizedGarbages(holeColumn, columnCount, length) {
    let currentHole = holeColumn;
    const garbages = new Array(length).fill().map(_ => {
        return generateGarbageRow(currentHole, columnCount);
    });

    return { currentHole, garbages };
}

export class GarbageGenerator {

    holeColumn;
    #cellBoard;

    /** @param {CellBoard} cellBoard */
    constructor(cellBoard) {
        this.#cellBoard = cellBoard;
        this.holeColumn = 0;
    }

    /** @param {number} length */
    addGarbage(length) {
        if (length <= 0) return;

        const cellBoard = this.#cellBoard;

        const { garbages, currentHole } = generateRandomizedGarbages(this.holeColumn, this.#cellBoard.columnCount, length);
        this.holeColumn = currentHole;

        //for each row
        for (let ri = 0; ri < cellBoard.rowCount; ri++) {
            if (ri + length >= cellBoard.rowCount) { //create garbage lines
                cellBoard.table[ri] = garbages[ri + length - cellBoard.rowCount];
        } else { //take lower row
                cellBoard.table[ri] = cellBoard.table[ri + length];
            }
        }
    }
}

export class LinearDamageProvider {

/** @param {number} damagePerCount */
    constructor(damagePerCount) {
        this.chargedDamage = 0;
        this.damagePerCount = damagePerCount;
    }
    count() {
        this.chargedDamage += this.damagePerCount;
    }
    provide() {
        const damage = Math.floor(this.chargedDamage);
        this.chargedDamage -= damage;
        return damage;
    }
}


/**
 * @typedef {{
 *      length: number
 * }} ScheduledDamage
 * */

export class GameScheduledDamageState {
    /** @type {ScheduledDamage[]} */ damageStack = [];
}
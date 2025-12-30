/** Generate unique keys for Phaser.Texture.
 */
export class UniqueTextureKeyGenerator {

    #counter = 0;
    #key;

    /**  @param {string} key string included to the generated keys. */
    constructor(key) {
        this.#key = key;
    }

    /** @return {string} an unique key for Phaser.Texture */
    get() {
        this.#counter++;
        return "utkg" + this.#key + this.#counter;
    }
}

/** Register functions and call them as needed.
 *  The order of calls is same as the order of registration.
*/
export class FunctionsUpdator {

    #funcList = [];

    constructor() { }

    /** @param {function} func function to be updated */
    addFunction(func) {
        if (this.#funcList.includes(func)) return;
        this.#funcList.push(func);
    }

    /** @param {function} func function to be removed from the update list */
    removeFunction(func) {
        const index = this.#funcList.indexOf(func);
        if (index == -1) return;
        this.#funcList.splice(index, 1);
    }

    updateAll() {
        this.#funcList.forEach(func => func());
    }
}

/** Create functions to get relative position for board or etc
 * @param {number} cellWidth
 *  @param {number} rowCount width of the displayed board
 * @param {number} columnCount height of the displayed board
 * @param {number} rowOffset how far down to shift row
 * @param {number} columnOffset how far to shift column to the right
 * */
export function createRelativePositionGetter(cellWidth, rowCount, columnCount, rowOffset, columnOffset) {
    return {
        getRelativeY: /** Calculate relative y coordinate from given values. @param {number} row */ function(row) {
            return cellWidth * (rowOffset + row - rowCount / 2)
        },
        getRelativeX: /** Calculate relative x coordinate from given values. @param {number} column */ function(column) {
            return cellWidth * (columnOffset + column - columnCount / 2)
        }
    }
}


export function getRelativeY(row, cellWidth, rowCount) {
    return cellWidth * (10 + row - rowCount)
}

/** Calculate relative x coordinate from given values. */
export function getRelativeX(column, cellWidth, columnCount) {
    return cellWidth * (column - columnCount / 2)
}

/** Shuffle contents order @param {any[]} array @return {any[]} */
export function shuffle(array) {
    const returnArray = new Array(array.length).fill();
    return returnArray.map(_ => {
        const targetI = Math.floor(Math.random() * array.length);
        return array.splice(targetI, 1)[0];
    });
}

/**rotate row and column.
 * @param {number} rotation 0, 1, 2 or 3 clockwise
 * @return {{column: number, row: number}}*/
export function cellPosRotate4Way(column, row, rotation) {
    rotation %= 4;
    if (rotation == 1) {
        return { column: -row, row: column };
    }
    if (rotation == 2) {
        return { column: -column, row: -row };
    }
    if (rotation == 3) {
        return { column: row, row: -column };
    }
    return { row, column };
}

/** adjust url depending on the build mode @param {string} url */
export function viteURLify(url) {
    if(import.meta.env.PROD) return url.slice(1);
    else return url;
}

/** @param {number} value @param {number} max @param {number} min */
export function normalizeRotationInRange(value, max, min = 0) {
    if(max <= min) throw "max must be larger than min";
    const range = max - min;
    return (((value-min) %range) + range) % range;
}
import { Mino } from "./mechanics";

/** 
 * @typedef {{row: number, column: number}[]} RotationMap
 *  */

/** @type {RotationMap} */
const MAP_EMPTY = [];
/** @type {RotationMap} */
const MAP_NOKICK = [{ row: 0, column: 0 }];

/** Contains RotationMaps for each direction & rotation combination */
class RotationPack {

    /** @type {{ left: RotationMap[], right: RotationMap[] }} */
    mapList;

    /** @param {{ left: RotationMap[], right: RotationMap[] }} mapList */
    constructor(mapList) { this.mapList = mapList }

    /** @param {number} currentRotation rotation in angle @param {number} rotation rotation in angle @return {RotationMap}*/
    getMap(currentRotation, rotation) {
        const index = Math.floor(currentRotation / 90) % 4;
        if (rotation%360 == 90) return this.mapList.right[index];
        if (rotation%360 == 270) return this.mapList.left[index];
        return MAP_EMPTY;
    }
}

export class RotationSystem {

    constructor() { }

    /** @param {number} minoType @return {RotationPack} */
    distributeRotationPack(minoType) {
    }

    /** @param {number} minoType @param {number} currentRotation rotation in angle @param {number} rotation rotation in angle @return {RotationMap}*/
    getMap(minoType, currentRotation, rotation) {
        return this.distributeRotationPack(minoType).getMap(currentRotation, rotation);
    }
    /** @param {Mino} mino 0~3 clockwise @param {number} rotation rotation in angle @return {RotationMap}*/
    getMapFromMino(mino, rotation) {
        return this.getMap(mino.type, mino.rotation, rotation);
    }
}

/** @param {string} json must be in this format '[[x,y]]' @return {RotationMap}*/
function parseJSONToMap(json) {
    const array = JSON.parse(json);
    return array.map(arr => { return { column: arr[0], row: arr[1] } });
}

/** @param {RotationMap} rotationMap @param {boolean} xFlip @param {boolean} yFlip @return {RotationMap}*/
function flipMap(rotationMap, xFlip, yFlip) {
    return rotationMap.map(obj => {
        return {
            row: obj.row * (yFlip ? -1 : 1),
            column: obj.column * (xFlip ? -1 : 1)
        }
    });
}




export class RotationSystem_NoKick extends RotationSystem {

    /** @type {RotationPack} */
    #rotationPack;

    constructor() {
        super();
        this.#rotationPack = new RotationPack({ left: [MAP_NOKICK], right: [MAP_NOKICK] });
    }

    /** @param {number} minoType @return {RotationPack} */
    distributeRotationPack(minoType) {
        return this.#rotationPack;
    }
}

const standardRotationSize3Pack = (() => {
    const finallyLeftMap  = parseJSONToMap(`[[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]]`);
    const finallyRightMap = flipMap(finallyLeftMap, 1, 0);
    const fromLeftMap     = flipMap(finallyLeftMap, 1, 1);
    const fromRightMap    = flipMap(finallyRightMap, 1, 1);
    return new RotationPack({
        left: [
            finallyLeftMap, //top to left
            fromRightMap, //right to top
            finallyRightMap, //bottom to right
            fromLeftMap, //left to bottom
        ],
        right: [
            finallyRightMap, //top to right
            fromRightMap, //right to bottom
            finallyLeftMap, //bottom to left
            fromLeftMap, //left to top
        ]
    });
})();

const standardRotationIPack = (() => {
    const topToLeftMap  = parseJSONToMap(`[[0, 0], [-1, 0], [2, 0], [-1, -2], [2, 1]]`);
    const topToRightMap = parseJSONToMap(`[[0, 0], [-2, 0], [1, 0], [-2, 1], [1, -2]]`);
    const bottomToLeftMap = flipMap(topToRightMap, 1, 1);
    const bottomToRightMap = flipMap(topToLeftMap, 1, 1);
    return new RotationPack({
        left: [
            topToLeftMap, //top to left
            flipMap(topToRightMap, 1, 1), //right to top
            bottomToRightMap, //bottom to right
            flipMap(bottomToLeftMap, 1, 1), //left to bottom
        ],
        right: [
            topToRightMap, //top to right
            flipMap(bottomToRightMap, 1, 1), //right to bottom
            bottomToLeftMap, //bottom to left
            flipMap(topToLeftMap, 1, 1), //left to top
        ]
    });
})();

export class RotationSystem_Standard extends RotationSystem {

    #OPack = new RotationPack({ left: [MAP_NOKICK], right: [MAP_NOKICK] });

    constructor() {
        super();
    }

    /** @param {number} minoType @return {RotationPack} */
    distributeRotationPack(minoType) {
        if(minoType === 2) { //O
            return this.#OPack;
        } 
        if(minoType === 4) { //I
            return standardRotationIPack;
        }
        return standardRotationSize3Pack;
    }
}
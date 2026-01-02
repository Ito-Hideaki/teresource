import { Mino } from "./mechanics";
import { normalizeRotationInRange as normalize } from "#util";

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
        const rotationIn360 = normalize(rotation, 360);
        const index = normalize(Math.floor(currentRotation / 90), 4);
        if (rotationIn360 == 90) return this.mapList.right[index];
        if (rotationIn360 == 270) return this.mapList.left[index];
        return MAP_EMPTY;
    }
}

/** @type {RotationPack} */
const PACK_NOKICK = (() => {
    const leftArray = [], rightArray = [];
    for(let i = 0; i < 4; i++) {
        leftArray.push(MAP_NOKICK);
        rightArray.push(MAP_NOKICK);
    }
    return new RotationPack({ left: leftArray, right: rightArray });
})();

export class RotationSystem {

    constructor() { }

    /** @param {string} minoType @return {RotationPack} */
    distributeRotationPack(minoType) {
    }

    /** @param {string} minoType @param {number} currentRotation rotation in angle @param {number} rotation rotation in angle @return {RotationMap}*/
    getMap(minoType, currentRotation, rotation) {
        return this.distributeRotationPack(minoType).getMap(currentRotation, rotation);
    }
    /** @param {Mino} mino @param {number} rotation rotation in angle @return {RotationMap}*/
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

    constructor() {
        super();
    }

    /** @param {number} minoType @return {RotationPack} */
    distributeRotationPack(minoType) {
        return PACK_NOKICK;
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

    constructor() {
        super();
    }

    /** @param {string} minoType @return {RotationPack} */
    distributeRotationPack(minoType) {
        switch(minoType) {
            case "o":
                return PACK_NOKICK;
            case "i":
                return standardRotationIPack;
            default:
                return standardRotationSize3Pack;
        }
    }
}
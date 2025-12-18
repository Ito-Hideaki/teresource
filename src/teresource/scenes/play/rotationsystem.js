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
        return this.getMap(mino.type, Math.floor(mino.rotation / 90), rotation);
    }
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
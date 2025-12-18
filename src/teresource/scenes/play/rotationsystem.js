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

    /** @param {number} rotation 0~3 clockwise @param {number} direction left<0<right @return {RotationMap}*/
    getMap(rotation, direction) {
        if (direction > 0) return this.mapList.right[rotation];
        if (direction < 0) return this.mapList.left[rotation];
        return MAP_EMPTY;
    }
}

export class RotationSystem {

    constructor() { }

    /** @param {number} minoType @return {RotationPack} */
    distributeRotationPack(minoType) {
    }

    /** @param {number} minoType @param {number} rotation 0~3 clockwise @param {number} direction left<0<right @return {RotationMap}*/
    getMap(minoType, rotation, direction) {
        return this.distributeRotationPack(minoType).getMap(rotation, direction);
    }
    /** @param {Mino} mino 0~3 clockwise @param {number} direction left<0<right @return {RotationMap}*/
    getMapFromMino(mino, direction) {
        return this.getMap(mino.type, Math.floor(mino.rotation / 90), direction);
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
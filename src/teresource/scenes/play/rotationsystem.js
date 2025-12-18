/** 
 * @typedef {{row: number, column: number}[]} RotationMap
 *  */

/** @type {RotationMap} */
const emptyRotationMap = [];

/** Contains 8 RotationMaps */
class RotationPack {
    
    /** @type {{ left: RotationMap[], right: RotationMap[] }} */
    mapList;

    constructor() {}

    /** @param {number} rotation 0~3 clockwise @param {number} direction left<0<right @return {RotationMap}*/
    getMap(rotation, direction) {
        if(direction > 0) return this.mapList.right[rotation];
        if(direction < 0) return this.mapList.left[rotation];
        return emptyRotationMap;
    }
}


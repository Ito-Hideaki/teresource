import { CellBoard, Mino } from "./mechanics";
import { RotationSystem } from "./rotationsystem";

export class RotationHandler {
    /** @type {RotationSystem} */
    #rotationSystem
    /** @type {CellBoard} */
    #cellBoard

    /** @param {rotationSystem} RotationSystem @param {CellBoard} cellBoard */
    constructor(rotationSystem, cellBoard) {
        this.#rotationSystem = rotationSystem;
        this.#cellBoard = cellBoard;
    }

    /** Try mino rotation and return the resulting translation from the current position
     * @param {number} row @param {number} column @param {Mino} mino angle @return {{row: number, column: number } | false}
     * */
    simulateRotation(row, column, mino, angle) {
        if (angle === 0) return false;

        const rotationMap = this.#rotationSystem.getMapFromMino(mino, angle);
        const rotatedMino = mino.copyRotated(angle);

        for (let i = 0; i < rotationMap.length; i++) {
            const movedRow = row + rotationMap[i].row;
            const movedColumn = column + rotationMap[i].column;
            if (!this.#cellBoard.doesMinoCollides(rotatedMino, movedRow, movedColumn)) {
                return structuredClone(rotationMap[i]);
            }
        }
        return false;
    }
}
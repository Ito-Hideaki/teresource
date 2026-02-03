import { GameContext } from "../infra/context"

/** @param {GameContext} gameContext */
export function createFunction_DoesCurrentMinoCollide(gameContext) {
    return function() {
        const mng = gameContext.currentMinoManager;
        return gameContext.cellBoard.doesMinoCollides(mng.mino, mng.row, mng.column);
    }
}
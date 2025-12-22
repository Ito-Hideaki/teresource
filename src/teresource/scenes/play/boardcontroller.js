// @ts-check

import { CurrentMinoManager, MinoQueueManager } from "./minomanager";
import { Cell, CellBoard } from "./mechanics";
import { GameContext } from "./context";
import { RotationSystem } from "./rotationsystem";

export class ControlOrder {

    static MOVE_LEFT = 0x0001;
    static MOVE_RIGHT = 0x0002;
    static START_SOFT_DROP = 0x0004;
    static STOP_SOFT_DROP = 0x0008;
    static HARD_DROP = 0x0010;
    static ROTATE_CLOCK_WISE = 0x0020;
    static ROTATE_COUNTER_CLOCK = 0x0040;
    static ROTATE_180 = 0x0080;

    static START_MOVE_LEFT = 0x1_0000;
    static STOP_MOVE_LEFT = 0x2_0000;
    static START_MOVE_RIGHT = 0x4_0000;
    static STOP_MOVE_RIGHT = 0x8_0000;

    constructor(value = 0) {
        this.value = value;
    }

    setFalseAll() {
        this.value = 0;
    }

    /** @param {number} flag */
    setTrue(flag) {
        this.value |= flag;
    }

    /** @param {number} flag */
    setFalse(flag) {
        this.value = this.value & ~flag;
    }

    /** @param {number} flag @return boolean */
    get(flag) {
        return !!(this.value & flag);
    }
}

const CO = ControlOrder;

/** Contains BoardController primitive status */
export class BoardControlState {
    /** @type number */
    fallingProgress = 0;
    /** @type number */
    lockDownCount = 0;
    /** @type boolean */
    softDrop = false;
    constructor() {
    }
}

/** 
 * @typedef {{
 *     horizontalMinoMove: number,
 *     verticalMinoMove: number,
 *     placedByHardDrop: boolean,
 *     placedByLockDown: boolean,
 * }} BoardControlResult
 * 
*/

/** @return BoardControlResult */
export function createBoardControlResult() {
    /** @type {BoardControlResult} */
    const obj = {
        horizontalMinoMove: 0,
        verticalMinoMove: 0,
        placedByHardDrop: false,
        placedByLockDown: false,
    };
    return obj;
}

class RotationHandler {
    /** @type {RotationSystem} */
    #rotationSystem
    /** @type {CellBoard} */
    #cellBoard
    /** @type {CurrentMinoManager} */
    #currentMinoManager

    /** @param {GameContext} gameContext */
    constructor(gameContext) {
        this.#rotationSystem = gameContext.rotationSystem;
        this.#cellBoard = gameContext.cellBoard;
        this.#currentMinoManager = gameContext.currentMinoManager;
    }

    /** Try mino rotation and return the resulting translation from the current position @param {number} angle @return {{row: number, column: number } | false} */
    simulateRotation(angle) {
        if(angle === 0) return false;

        const minoMng = this.#currentMinoManager;

        const rotationMap = this.#rotationSystem.getMapFromMino(minoMng.mino, angle);
        const rotatedMino = minoMng.mino.copyRotated(angle);

        for (let i = 0; i < rotationMap.length; i++) {
            const movedRow = minoMng.row + rotationMap[i].row;
            const movedColumn = minoMng.column + rotationMap[i].column;
            if (!this.#cellBoard.doesMinoCollides(rotatedMino, movedRow, movedColumn)) {
                return structuredClone(rotationMap[i]);
            }
        }
        return false;
    }
}

/**Manage Board and Mino states, progress it with update()
 * Does not contain any primitive status itself, so the outcome is determined by external states and inputs */
export class BoardController {

    /** @typedef {{horizontalMinoMove: number, verticalMinoMove: number }} minoMoves */
    /** @type {CurrentMinoManager} */
    #currentMinoManager;
    /** @type {CellBoard} */
    #cellBoard;
    /** @type {BoardControlState} */
    #state;
    /** @type {MinoQueueManager} */
    #minoQueueManager;
    /** @type {RotationHandler} */
    #rotationHandler;

    /**
     *  @param { GameContext } context
    */
    constructor(context) {
        this.#currentMinoManager = context.currentMinoManager;
        this.#cellBoard = context.cellBoard;
        this.#state = context.boardControlState;
        this.#minoQueueManager = context.minoQueueManager;
        this.#rotationHandler = new RotationHandler(context);
    }

    /** advance time
     * @param {number} controlOrderFlag
     * @param {number} deltaTime
     * @return {BoardControlResult}
     */
    update(controlOrderFlag, deltaTime = 0.016667) {
        const order = new ControlOrder();
        order.value = controlOrderFlag;

        if (this.#currentMinoManager.isPlaced) {
            this.#update_newMino();
        }
        this.#update_processSoftDropInputs(order.value);

        this.#update_advanceFallingProgress(deltaTime);

        this.#update_rotateMino(order.value);

        const minoMoveResult = this.#update_gravityAndMove(order.value);

        const isMinoPlacedByHardDrop = this.#update_hardDrop(order.value);

        order.setFalseAll();

        this.#update_lockdownReset(minoMoveResult);
        const isMinoPlacedByLockDown = this.#update_lockDown(deltaTime);

        if (isMinoPlacedByHardDrop || isMinoPlacedByLockDown) {
            this.#update_placeMino();
        }

        if (this.#currentMinoManager.isPlaced) {
            this.#update_newMino();
        }

        const result = createBoardControlResult();
        result.placedByHardDrop = isMinoPlacedByHardDrop;
        result.placedByHardDrop = isMinoPlacedByLockDown;
        Object.assign(result, minoMoveResult);
        return result;
    }

    /** @param {minoMoves} minoMoves */
    #update_lockdownReset(minoMoves) {
        if (minoMoves.horizontalMinoMove != 0 || minoMoves.verticalMinoMove != 0) {
            this.#state.lockDownCount = 0;
        }
    }

    /** Measure passed time, judge if the mino has locked down
     * @param {number} deltaTime
     * @return {boolean} lockdown judgement
     */
    #update_lockDown(deltaTime) {
        const minoMng = this.#currentMinoManager;
        if (this.#cellBoard.doesMinoCollides(minoMng.mino, minoMng.row + 1, minoMng.column)) {
            this.#state.lockDownCount += deltaTime;
            if (this.#state.lockDownCount > 0.5) {
                return true;
            }
        } else {
            this.#state.lockDownCount = 0;
        }
        return false;
    }

    /** start/stop softDrop @param {number} controlSoftDropFlag START_SOFT_DROP & STOP_SOFT_DROP */
    #update_processSoftDropInputs(controlSoftDropFlag) {
        if (controlSoftDropFlag & CO.START_SOFT_DROP) {
            this.#state.softDrop = true;
        }
        if (controlSoftDropFlag & CO.STOP_SOFT_DROP) {
            this.#state.softDrop = false;
        }
    }

    /** @param {number} deltaTime */
    #update_advanceFallingProgress(deltaTime) {
        const minoMng = this.#currentMinoManager;
        if (this.#cellBoard.doesMinoCollides(minoMng.mino, minoMng.row + 1, minoMng.column)) {
            this.#state.fallingProgress = 0;
        } else {
            this.#state.fallingProgress += deltaTime * 60 * 0.02 * (this.#state.softDrop ? 20 : 1);
        }
    }

    /** Do mino freefall and movement
     * @param {number} controlMovementFlag MOVE_LEFT & MOVE_RIGHT
     * @return {minoMoves}
     * */
    #update_gravityAndMove(controlMovementFlag) {
        let horizontalMinoMove = 0, verticalMinoMove = 0;
        //usually execute it only once
        //when the gravity is very large, horizontal moving is tried more than once
        do {
            //move horizontally
            {
                const leftInput = !!(controlMovementFlag & CO.MOVE_LEFT);
                const rightInput = !!(controlMovementFlag & CO.MOVE_RIGHT);
                const horizontalIdealMove = -1 * +leftInput + 1 * +rightInput;
                const horizontalRealMove = this.#moveMinoHorizontally(horizontalIdealMove);
                horizontalMinoMove += horizontalRealMove;
            }
            //let mino fall
            if (this.#state.fallingProgress >= 1) {
                this.#state.fallingProgress--;
                const rowMoved = this.#moveMinoVertically(1);
                verticalMinoMove += rowMoved;
            }
        } while (this.#state.fallingProgress >= 1);

        return { horizontalMinoMove, verticalMinoMove };
    }

    /**  Do hard-dropping process
     * @param {number} controlHardDropFlag HARD_DROP
     * @return {boolean} if the mino has placed by hard-drop */
    #update_hardDrop(controlHardDropFlag) {
        if (controlHardDropFlag & CO.HARD_DROP) {
            this.#moveMinoVertically(99);
            return true;
        }
        return false;
    }

    /** @param {number} controlRotationFlag ROTATE_CLOCK_WISE & ROTATE_COUNTER_CLOCK*/
    #update_rotateMino(controlRotationFlag) {
        const minoMng = this.#currentMinoManager;

        let rotation = 0;
        if (controlRotationFlag & CO.ROTATE_CLOCK_WISE) rotation = 90;
        else if (controlRotationFlag & CO.ROTATE_COUNTER_CLOCK) rotation = 270;

        const resultTranslation = this.#rotationHandler.simulateRotation(rotation);
        if (resultTranslation) {
            minoMng.rotateMino(rotation);
            minoMng.row += resultTranslation.row;
            minoMng.column += resultTranslation.column;
            this.#state.lockDownCount = 0;
        }
    }

    #update_placeMino() {
        const minoMng = this.#currentMinoManager;
        const { table, topLeft } = minoMng.mino.convertToTable();
        const row = minoMng.row + topLeft.row;
        const column = minoMng.column + topLeft.column;
        this.#cellBoard.compositeMinoTable(table, row, column);
        minoMng.place();
    }

    #update_newMino() {
        //set CurrentMinoManager
        const nextMino = this.#minoQueueManager.takeNextMino();
        this.#currentMinoManager.startNextMino(nextMino);

        //set BoardControlState
        this.#state.fallingProgress = 0;
        this.#state.lockDownCount = 0;
    }


    /** Move this.#mino vertically within a range that does not collide @param {number} move @return the result amount of the movement*/
    #moveMinoVertically(move) {
        const minoMng = this.#currentMinoManager;
        const mino = this.#currentMinoManager.mino;
        const resultMove = this.#cellBoard.tryMoveMinoVertically(move, mino, minoMng.row, minoMng.column);
        minoMng.row += resultMove;
        return resultMove;
    }

    /** Move this.#mino horizontally within a range that does not collide @param {number} move @return the result amount of the movement*/
    #moveMinoHorizontally(move) {
        const minoMng = this.#currentMinoManager;
        const mino = this.#currentMinoManager.mino;
        const resultMove = this.#cellBoard.tryMoveMinoHorizontally(move, mino, minoMng.row, minoMng.column);
        minoMng.column += resultMove;
        return resultMove;
    }
}

class HorizontalLastPriorityJudge {
    /** @type {boolean} */
    #leftIsStrong = false;

    constructor() {
    }

    /** @param {number} flag controlOrderFlag */
    setNewPlayerInput(flag) {
        const flagOrder = new ControlOrder(flag);
        if (flagOrder.get(CO.START_MOVE_LEFT)) this.#leftIsStrong = true;
        if (flagOrder.get(CO.START_MOVE_RIGHT)) this.#leftIsStrong = false;
    }

    getLeftIsStrong() {
        return this.#leftIsStrong;
    }

    /** 
     * @param {boolean} leftInput
     *  @param {boolean} rightInput
     * @return {number} flag */
    judgeToFlag(leftInput, rightInput) {
        if (leftInput && rightInput) {
            return this.#leftIsStrong ? CO.MOVE_LEFT : CO.MOVE_RIGHT;
        } else {
            return CO.MOVE_LEFT * +leftInput + CO.MOVE_RIGHT * +rightInput;
        }
    }
}

/** receives player inputs, calculates DAS, ARR and else and provides controlOrder for each frame
 * Flow : setNewPlayerInput > provideControlOrder > receiveControlResult > advanceTime
 */
export class ControlOrderProvider {

    /** @type {ControlOrder} */
    #controlOrder;
    /** @type {boolean} */
    leftMoveDown = false;
    /** @type {boolean} */
    rightMoveDown = false;

    #DASConfig = 10;
    /** frames until the auto shift get enabled @type {number} */
    DASTimerF = 0;
    /** frames until the mino can move horizontally again @type {number} */
    ARRTimerF = 0;

    #horizontalJudge;

    autoShiftEnabled() {
        return this.DASTimerF <= 0 && (this.leftMoveDown || this.rightMoveDown);
    }

    constructor() {
        this.#controlOrder = new ControlOrder();
        this.#horizontalJudge = new HorizontalLastPriorityJudge();
    }

    #resetDAS() {
        this.DASTimerF = this.#DASConfig;
    }

    /** receive player inputs as a flag.
     *  Can be called multiple times. 
     * @param {number} flag controlOrderFlag */
    setNewPlayerInput(flag) {
        this.#controlOrder.setTrue(flag);
        this.#setNewPlayerInput_receiveHorizontal(flag);
        this.#horizontalJudge.setNewPlayerInput(flag);
    }

    /** @param {number} flag controlOrderFlag */
    #setNewPlayerInput_receiveHorizontal(flag) {
        const flagOrder = new ControlOrder(flag);
        if (flagOrder.get(CO.START_MOVE_LEFT)) this.leftMoveDown = true;
        if (flagOrder.get(CO.STOP_MOVE_LEFT)) this.leftMoveDown = false;
        if (flagOrder.get(CO.START_MOVE_RIGHT)) this.rightMoveDown = true;
        if (flagOrder.get(CO.STOP_MOVE_RIGHT)) this.rightMoveDown = false;

        if (flagOrder.get(CO.START_MOVE_LEFT + CO.START_MOVE_RIGHT)) {
            this.#resetDAS();
        }
    }

    /** Advance the time, decrease timers (or reset them) @param {number} deltaTime */
    advanceTime(deltaTime) {
        const passedFrames = 1;
        this.ARRTimerF -= passedFrames;
        if (this.leftMoveDown || this.rightMoveDown) {
            this.DASTimerF -= passedFrames;
        }
    }

    /** Require ControlResults to set cooldown properly @param {BoardControlResult} controlResult */
    receiveControlResult(controlResult) {
        if (controlResult.horizontalMinoMove) {
            this.ARRTimerF = 2;
        }
    }

    /** @return {ControlOrder} */
    provideControlOrder() {
        this.#provide_doHorizontalControl();
        const order = new ControlOrder(this.#controlOrder.value);
        this.#controlOrder.setFalseAll();
        return order;
    }

    #provide_doHorizontalControl() {
        const isFirstPressedFrame = this.#controlOrder.get(CO.START_MOVE_LEFT | CO.START_MOVE_RIGHT);
        if (this.ARRTimerF <= 0) {
            if (isFirstPressedFrame || this.autoShiftEnabled()) {
                const flag = this.#horizontalJudge.judgeToFlag(this.leftMoveDown, this.rightMoveDown);
                this.#controlOrder.setTrue(flag);
            }
        }
    }
}
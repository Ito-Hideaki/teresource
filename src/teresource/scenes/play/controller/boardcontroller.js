// @ts-check

import { CurrentMinoManager } from "../core/minomanager";
import { CellBoard } from "../core/mechanics";
import { GameContext } from "../infra/context";
import { RotationSystem } from "../core/rotationsystem";

export class ControlOrder {

    static MOVE_LEFT            = 0x0001;
    static MOVE_RIGHT           = 0x0002;
    static START_SOFT_DROP      = 0x0004;
    static STOP_SOFT_DROP       = 0x0008;
    static HARD_DROP            = 0x0010;
    static ROTATE_CLOCK_WISE    = 0x0020;
    static ROTATE_COUNTER_CLOCK = 0x0040;
    static ROTATE_180           = 0x0080;
    static HOLD                 = 0x0100;

    static START_MOVE_LEFT  = 0x1_0000;
    static STOP_MOVE_LEFT   = 0x2_0000;
    static START_MOVE_RIGHT = 0x4_0000;
    static STOP_MOVE_RIGHT  = 0x8_0000;

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

/** Contains BoardUpdater primitive status */
export class BoardUpdateState {
    /** @type number */
    fallingProgress = 0;
    /** @type number */
    lockDownCount = 0;
    /** @type boolean */
    softDrop = false;
    constructor() {
    }
    startNewMino() {
        this.lockDownCount = 0;
        this.fallingProgress = 0;
    }
}

export class BoardUpdateDiff {
    /** @type {number} */ horizontalMinoMove = 0;
    /** @type {number} */ verticalMinoMove = 0;
    /** @type {boolean} */ placedByHardDrop = false;
    /** @type {boolean} */ placedByLockDown = false;
    /** @type {number} */ appliedRotationAngle = 0;
    /** @type {BoardUpdateState} */ newState = new BoardUpdateState();
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
        if (angle === 0) return false;

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

/** @typedef {{horizontalMinoMove: number, verticalMinoMove: number }} minoMoves */
/** @typedef {{ cellBoard: CellBoard, currentMinoManager: CurrentMinoManager, boardUpdateState: BoardUpdateState }} BoardUpdateCalculatorParams */

/**Calculate what will happen next frame given the current state.
 * Does not contain any primitive status itself */
export class BoardUpdateCalculator {
    /** @type {RotationHandler} */
    #rotationHandler;

    /**
     *  @param { GameContext } context
    */
    constructor(context) {
        this.#rotationHandler = new RotationHandler(context);
    }

    /** calculate next frame state and actions
     * @param {number} controlOrderFlag
     * @param {number} deltaTime
     * @param {BoardUpdateCalculatorParams} params
     * @return {BoardUpdateDiff}
     */
    calculate(controlOrderFlag, deltaTime = 0.016667, params) {
        const order = new ControlOrder();
        order.value = controlOrderFlag;

        //Copy states for calculation
        const copiedCurrentMinoManager = params.currentMinoManager.duplicate();
        const diff = new BoardUpdateDiff();
        diff.newState = structuredClone(params.boardUpdateState);

        //Main process
        this.#update_processSoftDropInputs(order.value, diff.newState);

        this.#update_advanceFallingProgress(deltaTime, diff.newState, params, copiedCurrentMinoManager);

        const appliedRotationAngle = this.#update_rotateMino(order.value, diff.newState, params, copiedCurrentMinoManager);

        this.#update_gravityAndMove(order.value, diff.newState, params, copiedCurrentMinoManager);

        const isMinoPlacedByHardDrop = this.#update_hardDrop(order.value, params, copiedCurrentMinoManager);

        order.setFalseAll();

        /** @type {minoMoves} */ const minoMoveResult = {
            horizontalMinoMove: copiedCurrentMinoManager.column - params.currentMinoManager.column,
            verticalMinoMove: copiedCurrentMinoManager.row - params.currentMinoManager.row,
        }
        this.#update_lockdownReset(minoMoveResult, diff.newState);

        const isMinoPlacedByLockDown = this.#update_lockDown(deltaTime, diff.newState, params, copiedCurrentMinoManager);

        //Diff assembly
        Object.assign(diff, minoMoveResult); //horizontal/vertical mino move
        diff.placedByHardDrop = isMinoPlacedByHardDrop;
        diff.placedByLockDown = isMinoPlacedByLockDown;
        diff.appliedRotationAngle = appliedRotationAngle;
        return diff;
    }

    /** @param {minoMoves} minoMoves @param {BoardUpdateState} state */
    #update_lockdownReset(minoMoves, state) {
        if (minoMoves.horizontalMinoMove != 0 || minoMoves.verticalMinoMove != 0) {
            state.lockDownCount = 0;
        }
    }

    /** Measure passed time, judge if the mino has locked down (not placed mino yet)
     * @param {number} deltaTime @param {BoardUpdateState} state @param {BoardUpdateCalculatorParams} params @param {CurrentMinoManager} copiedCurrentMinoManager
     * @return {boolean} lockdown judgement
     */
    #update_lockDown(deltaTime, state, params, copiedCurrentMinoManager) {
        const minoMng = copiedCurrentMinoManager;
        if (params.cellBoard.doesMinoCollides(minoMng.mino, minoMng.row + 1, minoMng.column)) {
            state.lockDownCount += deltaTime;
            if (state.lockDownCount > 0.5) {
                return true;
            }
        } else {
            state.lockDownCount = 0;
        }
        return false;
    }

    /** start/stop softDrop @param {number} controlSoftDropFlag START_SOFT_DROP & STOP_SOFT_DROP @param {BoardUpdateState} state */
    #update_processSoftDropInputs(controlSoftDropFlag, state) {
        if (controlSoftDropFlag & CO.START_SOFT_DROP) {
            state.softDrop = true;
        }
        if (controlSoftDropFlag & CO.STOP_SOFT_DROP) {
            state.softDrop = false;
        }
    }

    /** @param {number} deltaTime @param {BoardUpdateState} state @param {BoardUpdateCalculatorParams} params @param {CurrentMinoManager} copiedCurrentMinoManager */
    #update_advanceFallingProgress(deltaTime, state, params, copiedCurrentMinoManager) {
        const minoMng = copiedCurrentMinoManager;
        if (params.cellBoard.doesMinoCollides(minoMng.mino, minoMng.row + 1, minoMng.column)) {
            state.fallingProgress = 0;
        } else {
            state.fallingProgress += deltaTime * 60 * 0.02 * (state.softDrop ? 20 : 1);
        }
    }

    /** Do mino freefall and movement
     * @param {number} controlMovementFlag MOVE_LEFT & MOVE_RIGHT @param {BoardUpdateState} state @param {BoardUpdateCalculatorParams} params @param {CurrentMinoManager} copiedCurrentMinoManager 
     * */
    #update_gravityAndMove(controlMovementFlag, state, params, copiedCurrentMinoManager) {
        let horizontalMinoMove = 0, verticalMinoMove = 0;
        //usually execute it only once
        //when the gravity is very large, horizontal moving is tried more than once
        do {
            //move horizontally
            if(horizontalMinoMove === 0) {
                const leftInput = !!(controlMovementFlag & CO.MOVE_LEFT);
                const rightInput = !!(controlMovementFlag & CO.MOVE_RIGHT);
                const horizontalIdealMove = -1 * +leftInput + 1 * +rightInput;
                const horizontalRealMove = this.#moveMinoHorizontally(horizontalIdealMove, params, copiedCurrentMinoManager);
                horizontalMinoMove += horizontalRealMove;
            }
            //let mino fall
            if (state.fallingProgress >= 1) {
                state.fallingProgress--;
                const rowMoved = this.#moveMinoVertically(1, params, copiedCurrentMinoManager);
                verticalMinoMove += rowMoved;
            }
        } while (state.fallingProgress >= 1);
    }

    /**  Do hard-dropping process (not actually placed yet)
     * @param {number} controlHardDropFlag HARD_DROP @param {BoardUpdateCalculatorParams} params @param {CurrentMinoManager} copiedCurrentMinoManager
     * @return {boolean} if the mino has placed by hard-drop */
    #update_hardDrop(controlHardDropFlag, params, copiedCurrentMinoManager) {
        if (controlHardDropFlag & CO.HARD_DROP) {
            this.#moveMinoVertically(99, params, copiedCurrentMinoManager);
            return true;
        }
        return false;
    }

    /** @param {number} controlRotationFlag ROTATE_CLOCK_WISE & ROTATE_COUNTER_CLOCK @param {BoardUpdateState} state @param {BoardUpdateCalculatorParams} params @param {CurrentMinoManager} copiedCurrentMinoManager @return {number} appliedRotationAngle */
    #update_rotateMino(controlRotationFlag, state, params, copiedCurrentMinoManager) {
        const minoMng = copiedCurrentMinoManager;

        let rotation = 0;
        if (controlRotationFlag & CO.ROTATE_CLOCK_WISE) rotation = 90;
        else if (controlRotationFlag & CO.ROTATE_COUNTER_CLOCK) rotation = 270;

        const resultTranslation = this.#rotationHandler.simulateRotation(rotation);
        if (resultTranslation) {
            minoMng.rotateMino(rotation);
            minoMng.row += resultTranslation.row;
            minoMng.column += resultTranslation.column;
            state.lockDownCount = 0;
            return rotation;
        }
        return 0;
    }

    /** Move mino vertically within a range that does not collide @param {number} move @param {BoardUpdateCalculatorParams} params @param {CurrentMinoManager} copiedCurrentMinoManager @return the result amount of the movement*/
    #moveMinoVertically(move, params, copiedCurrentMinoManager) {
        const minoMng = copiedCurrentMinoManager;
        const resultMove = params.cellBoard.tryMoveMinoVertically(move, minoMng.mino, minoMng.row, minoMng.column);
        minoMng.row += resultMove;
        return resultMove;
    }

    /** Move mino horizontally within a range that does not collide @param {number} move  @param {BoardUpdateCalculatorParams} params @param {CurrentMinoManager} copiedCurrentMinoManager @return the result amount of the movement*/
    #moveMinoHorizontally(move, params, copiedCurrentMinoManager) {
        const minoMng = copiedCurrentMinoManager;
        const resultMove = params.cellBoard.tryMoveMinoHorizontally(move, minoMng.mino, minoMng.row, minoMng.column);
        minoMng.column += resultMove;
        return resultMove;
    }
}

/**Manage Board and Mino states, progress it with update()
 * Does not contain any primitive status itself, so the outcome is determined by external states and inputs */
export class BoardUpdater {

    /** @typedef {{horizontalMinoMove: number, verticalMinoMove: number }} minoMoves */
    /** @type {CurrentMinoManager} */
    #currentMinoManager;
    /** @type {CellBoard} */
    #cellBoard;
    /** @type {BoardUpdateState} */
    #state;
    /** @type {BoardUpdateCalculator} */
    #boardUpdateCalculator;

    /**
     *  @param { GameContext } context
    */
    constructor(context) {
        this.#currentMinoManager = context.currentMinoManager;
        this.#cellBoard = context.cellBoard;
        this.#state = context.boardUpdateState;
        this.#boardUpdateCalculator = new BoardUpdateCalculator(context);
    }

    /** advance time
     * @param {number} controlOrderFlag
     * @param {number} deltaTime
     * @return {BoardUpdateDiff}
     */
    update(controlOrderFlag, deltaTime = 0.016667) {
        const diff = this.#boardUpdateCalculator.calculate(controlOrderFlag, deltaTime, {
            boardUpdateState: this.#state,
            currentMinoManager: this.#currentMinoManager,
            cellBoard: this.#cellBoard
        });
        this.#update_applyDiff(diff);
        return diff;
    }

    /** @param {BoardUpdateDiff} diff */
    #update_applyDiff(diff) {
        const cmg = this.#currentMinoManager;
        Object.assign(this.#state, diff.newState);
        cmg.row += diff.verticalMinoMove;
        cmg.column += diff.horizontalMinoMove;
        cmg.rotateMino(diff.appliedRotationAngle);
        if (diff.placedByHardDrop || diff.placedByLockDown) {
            this.#currentMinoManager.place();
            const { table, topLeft } = cmg.mino.convertToTable();
            this.#cellBoard.compositeMinoTable(table, cmg.row + topLeft.row, cmg.column + topLeft.column);
        }
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

/**
 *  @typedef {{
 *    DAS: number,
 *    ARR: number
 * }} ControlOrderProviderConfig
 *  */

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

    #DASConfig;
    #ARRConfig;
    /** frames until the auto shift get enabled @type {number} */
    DASTimerF = 0;
    /** frames until the mino can move horizontally again @type {number} */
    ARRTimerF = 0;

    #horizontalJudge;

    autoShiftEnabled() {
        return this.DASTimerF <= 0 && (this.leftMoveDown || this.rightMoveDown);
    }

    /** @param {ControlOrderProviderConfig} config */
    constructor(config) {
        this.#ARRConfig = config.ARR;
        this.#DASConfig = config.DAS;
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

    /** Require ControlResults to set cooldown properly @param {BoardUpdateDiff} controlDiff */
    receiveControlResult(controlDiff) {
        if (controlDiff.horizontalMinoMove) {
            this.ARRTimerF = this.#ARRConfig;
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

    resetARR() {
        this.ARRTimerF = 0;
    }
}
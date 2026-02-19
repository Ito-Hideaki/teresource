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
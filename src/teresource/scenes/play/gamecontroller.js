import { ControlOrder, BoardController, createBoardControlResult, ControlOrderProvider } from "./boardcontroller";
import { GameContext } from "./context";

/** Represents the logic og the game attached to each player */
export class GameController {

    #boardController
    #controlOrderProvider
    /** @type {import("./boardcontroller").BoardControlResult} */
    #lastBoardControlResult

    /**
     * @param {GameContext} gameContext
     * @param {{boardController: BoardController, controlOrderProvider: ControlOrderProvider}} $
     */
    constructor(gameContext, $) {
        this.#controlOrderProvider = $.controlOrderProvider;
        this.#boardController = $.boardController;

        // this.#scene.input.keyboard.on("keydown", e => {
        //     if (e.repeat) {
        //         e.preventDefault(); return;
        //     }
        //     //list of controlOrders assigned to a perticulay key
        //     const controlOrderList = {
        //         "ArrowLeft" : ControlOrder.START_MOVE_LEFT,
        //         "ArrowRight": ControlOrder.START_MOVE_RIGHT,
        //         "ArrowDown" : ControlOrder.START_SOFT_DROP,
        //         "KeyX"      : ControlOrder.ROTATE_CLOCK_WISE,
        //         "KeyZ"      : ControlOrder.ROTATE_COUNTER_CLOCK,
        //         "Space"     : ControlOrder.HARD_DROP,
        //     }
        //     if (Object.keys(controlOrderList).includes(e.code)) {
        //         e.preventDefault();
        //         this.#controlOrderProvider.setNewPlayerInput(controlOrderList[e.code]);
        //     }
        // });

        // this.#scene.input.keyboard.on("keyup", e => {
        //     //list of controlOrders assigned to a perticulay key
        //     const controlOrderList = {
        //         "ArrowLeft" : ControlOrder.STOP_MOVE_LEFT,
        //         "ArrowRight": ControlOrder.STOP_MOVE_RIGHT,
        //         "ArrowDown" : ControlOrder.STOP_SOFT_DROP,
        //     }
        //     if (Object.keys(controlOrderList).includes(e.code)) {
        //         e.preventDefault();
        //         this.#controlOrderProvider.setNewPlayerInput(controlOrderList[e.code]);
        //     }
        // })

        this.#lastBoardControlResult = new createBoardControlResult();
    }

    /** @param {number} deltaTime */
    update(deltaTime) {
        const controlOrder = this.#controlOrderProvider.provideControlOrder();
        this.#lastBoardControlResult = this.#boardController.update(controlOrder.value, deltaTime);
        this.#controlOrderProvider.receiveControlResult(this.#lastBoardControlResult);
        this.#controlOrderProvider.advanceTime(deltaTime);
    }
}
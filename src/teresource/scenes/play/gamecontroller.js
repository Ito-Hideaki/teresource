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
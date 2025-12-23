import { ControlOrder, BoardController, ControlOrderProvider, BoardControlDiff } from "./boardcontroller";
import { GameContext } from "./context";

/** Represents the logic og the game attached to each player */
export class GameController {

    #boardController
    #controlOrderProvider
    /** @type {BoardControlDiff} */
    #lastBoardControlDiff
    #currentMinoManager
    #minoQueueManager
    #boardControlState

    /**
     * @param {GameContext} gameContext
     * @param {{boardController: BoardController, controlOrderProvider: ControlOrderProvider}} $
     */
    constructor(gameContext, $) {
        this.#controlOrderProvider = $.controlOrderProvider;
        this.#boardController = $.boardController;
        this.#minoQueueManager = gameContext.minoQueueManager;
        this.#currentMinoManager = gameContext.currentMinoManager;
        this.#boardControlState = gameContext.boardControlState;

        this.#lastBoardControlDiff = new BoardControlDiff();
    }

    /** @param {number} deltaTime */
    update(deltaTime) {

        const startNewMinoIfNeeded = () => {
            if (this.#currentMinoManager.isPlaced) {
                this.#currentMinoManager.startNextMino(this.#minoQueueManager.takeNextMino());
                this.#boardControlState.startNewMino();
            }
        }

        startNewMinoIfNeeded();
        //Advance a frame
        const controlOrder = this.#controlOrderProvider.provideControlOrder();
        this.#lastBoardControlDiff = this.#boardController.update(controlOrder.value, deltaTime);
        this.#controlOrderProvider.receiveControlResult(this.#lastBoardControlDiff);
        this.#controlOrderProvider.advanceTime(deltaTime);

        startNewMinoIfNeeded();
    }
}
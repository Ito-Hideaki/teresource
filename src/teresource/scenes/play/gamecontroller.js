import { ControlOrder, BoardUpdater, ControlOrderProvider, BoardUpdateDiff } from "./boardcontroller";
import { GameContext } from "./context";

/** Represents the logic og the game attached to each player */
export class GameController {

    #boardUpdater
    #controlOrderProvider
    /** @type {BoardUpdateDiff} */
    #lastBoardUpdateDiff
    #currentMinoManager
    #minoQueueManager
    #boardUpdateState

    /**
     * @param {GameContext} gameContext
     * @param {{boardUpdater: BoardUpdater, controlOrderProvider: ControlOrderProvider}} $
     */
    constructor(gameContext, $) {
        this.#controlOrderProvider = $.controlOrderProvider;
        this.#boardUpdater = $.boardUpdater;
        this.#minoQueueManager = gameContext.minoQueueManager;
        this.#currentMinoManager = gameContext.currentMinoManager;
        this.#boardUpdateState = gameContext.boardUpdateState;

        this.#lastBoardUpdateDiff = new BoardUpdateDiff();
    }

    /** @param {number} deltaTime */
    update(deltaTime) {

        const startNewMinoIfNeeded = () => {
            if (this.#currentMinoManager.isPlaced) {
                this.#currentMinoManager.startNextMino(this.#minoQueueManager.takeNextMino());
                this.#boardUpdateState.startNewMino();
            }
        }

        startNewMinoIfNeeded();
        //Advance a frame
        const controlOrder = this.#controlOrderProvider.provideControlOrder();
        this.#lastBoardUpdateDiff = this.#boardUpdater.update(controlOrder.value, deltaTime);
        this.#controlOrderProvider.receiveControlResult(this.#lastBoardUpdateDiff);
        this.#controlOrderProvider.advanceTime(deltaTime);

        startNewMinoIfNeeded();
    }
}
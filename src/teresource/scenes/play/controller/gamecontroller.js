import { ControlOrder, BoardUpdater, ControlOrderProvider, BoardUpdateDiff } from "./boardcontroller";
import { GameContext } from "../infra/context";
import { LineClearManager } from "../core/lineclear";

/** Represents the logic og the game attached to each player */
export class GameController {

    #boardUpdater
    #controlOrderProvider
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

        this.lineClearManager = new LineClearManager(gameContext); //temporary
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
        /** @type {ControlOrder} */ const controlOrder = this.#controlOrderProvider.provideControlOrder();
        this.#controlOrderProvider.advanceTime(deltaTime);
        /** @type {BoardUpdateDiff} */ const boardUpdateDiff = this.#boardUpdater.update(controlOrder.value, deltaTime);
        this.#controlOrderProvider.receiveControlResult(boardUpdateDiff);
        //Clear filled line (row)
        this.lineClearManager.update();

        startNewMinoIfNeeded();
    }
}
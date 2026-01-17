import { ControlOrder, BoardUpdater, ControlOrderProvider, BoardUpdateDiff } from "./boardcontroller";
import { GameContext } from "../infra/context";
import { LineClearManager } from "../core/lineclear";

/** Represents the logic og the game attached to each player */
export class GameController {

    #boardUpdater
    #controlOrderProvider
    #currentMinoManager
    #minoQueueManager
    #heldMinoManager
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
        this.#heldMinoManager = gameContext.heldMinoManager;
        this.#boardUpdateState = gameContext.boardUpdateState;

        this.lineClearManager = new LineClearManager(gameContext); //temporary
    }

    /** @param {number} deltaTime */
    update(deltaTime) {

        const putNewMino = (mino) => {
            this.#currentMinoManager.startNextMino(mino);
            this.#boardUpdateState.startNewMino();
        }

        this.lineClearManager.update(deltaTime);

        /** @type {ControlOrder} */ const controlOrder = this.#controlOrderProvider.provideControlOrder();

        if (this.#currentMinoManager.isPlaced) {
            this.#heldMinoManager.resetLimit();
            putNewMino(this.#minoQueueManager.takeNextMino());
        }
        if (controlOrder.get(ControlOrder.HOLD) && this.#heldMinoManager.canRecieveMino()) {
            const recievedMino = this.#heldMinoManager.recieveMino(this.#currentMinoManager.mino);
            putNewMino( recievedMino ?? this.#minoQueueManager.takeNextMino());
        }

        /** @type {BoardUpdateDiff} */ const boardUpdateDiff = this.#boardUpdater.update(controlOrder.value, deltaTime);
        this.#controlOrderProvider.receiveControlResult(boardUpdateDiff);
        this.#controlOrderProvider.advanceTime(deltaTime);
        //Clear filled line (row)
        this.lineClearManager.startClear(this.lineClearManager.findRowToClear());
    }
}
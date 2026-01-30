import { BoardView } from "./boardview";
import { BoardDeco } from "./boarddeco";
import { GameViewContext } from "../infra/context";
import { PlayScene } from "../../play";
import { HeldMinoView, MinoQueueView } from "./subminoview";
import { GameEffectManagerView } from "./gameeffectview";
import { GameStatsView } from "./gamestatsview";

/** @typedef {{ boardDeco: BoardDeco, boardView: BoardView, minoQueueView: MinoQueueView, heldMinoView: HeldMinoView, gameEffectManagerView: GameEffectManagerView, gameStatsView: GameStatsView }} GameViewElements */

/** Represents the game view for each player */
export class GameViewController {
    #elements;
    #boardContainer;
    set x(x) {
        this.#boardContainer.x = x;
    }
    set y(y) {
        this.#boardContainer.y = y;
    }

    /**
     *  @param {PlayScene} scene
     * @param {GameViewContext} gvContext
     * @param {GameViewElements} elements
     * @param {GameViewConfig} config
     */
    constructor(scene, gvContext, elements, config) {
        this.#boardContainer = gvContext.boardContainer;
        this.#elements = elements;
    }

    /** @param {number} deltaTime */
    update(deltaTime) {
        this.#elements.boardDeco.update();
        this.#elements.boardView.update();
        this.#elements.minoQueueView.update();
        this.#elements.heldMinoView.update();
        this.#elements.gameEffectManagerView.update(deltaTime);
        this.#elements.gameStatsView.update();
        // let rad = Math.atan2((this.#boardContainer.y - 360) / 15, (this.#boardContainer.x - 540) / 50);
        // rad += 0.1;
        // this.#boardContainer.x = 540 + Math.cos(rad) * 50;
        // this.#boardContainer.y = 360 + Math.sin(rad) * 15;
    }
}
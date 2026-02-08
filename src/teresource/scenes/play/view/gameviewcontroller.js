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
    boardContainer;

    /**
     *  @param {PlayScene} scene
     * @param {GameViewContext} gvContext
     * @param {GameViewElements} elements
     */
    constructor(scene, gvContext, elements) {
        this.#elements = elements;
        this.boardContainer = gvContext.boardContainer;
    }

    /** @param {number} deltaTime */
    update(deltaTime) {
        this.#elements.boardDeco.update();
        this.#elements.boardView.update();
        this.#elements.minoQueueView.update();
        this.#elements.heldMinoView.update();
        this.#elements.gameEffectManagerView.update(deltaTime);
        this.#elements.gameStatsView.update();
    }
}
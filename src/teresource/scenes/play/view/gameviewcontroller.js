import { BoardView } from "./boardview";
import { BoardDeco } from "./boarddeco";
import { GameViewContext } from "../infra/context";
import { PlayScene } from "../../play";
import { MinoQueueView } from "./subminoview";

/** 
 * @typedef {{
 *     boardCellWidth: number
 * }} GameViewConfig
 *  */

/** @param {GameViewConfig} gameViewConfig @return {import("./boarddeco").BoardDecoConfig} */
function getBoardDecoConfig(gameViewConfig) {
    return { boardCellWidth : gameViewConfig.boardCellWidth };
}

/** @param {GameViewConfig} gameViewConfig @return {import("./boardview").BoardViewConfig}*/
function getBoardViewConfig(gameViewConfig) {
    return { boardCellWidth : gameViewConfig.boardCellWidth };
}

/** Represents the game view for each player */
export class GameViewController {
    #boardView;
    #boardDeco;
    #boardContainer;
    #minoQueueView;
    set x(x) {
        this.#boardContainer.x = x;
    }
    set y(y) {
        this.#boardContainer.y = y;
    }

    /**
     *  @param {PlayScene} scene
     * @param {GameViewContext} gvContext
     * @param {GameViewConfig} config
     */
    constructor(scene, gvContext, config) {
        this.#boardContainer = gvContext.boardContainer;
        this.#boardDeco = new BoardDeco(scene, gvContext, getBoardDecoConfig(config));
        this.#boardView = new BoardView(scene, gvContext, getBoardViewConfig(config));
        this.#minoQueueView = new MinoQueueView(scene, 30, gvContext);
    }

    /** @param {number} deltaTime */
    update(deltaTime) {
        this.#boardDeco.update();
        this.#boardView.update();
        this.#minoQueueView.update();
        // let rad = Math.atan2((this.#boardContainer.y - 360) / 15, (this.#boardContainer.x - 540) / 50);
        // rad += 0.1;
        // this.#boardContainer.x = 540 + Math.cos(rad) * 50;
        // this.#boardContainer.y = 360 + Math.sin(rad) * 15;
    }
}
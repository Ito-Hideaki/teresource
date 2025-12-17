import Phaser from "phaser";
import { BoardView } from "./boardview";
import { BoardDeco } from "./boarddeco";
import { GameViewContext } from "./context";
import { PlayScene } from "../play";

/** Represents the game view for each player */
export class ViewController {
    #boardView;
    #boardDeco;
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
     */
    constructor(scene, gvContext) {
        this.#boardContainer = gvContext.boardContainer;
        this.#boardDeco = new BoardDeco(scene, 30, gvContext);
        this.#boardView = new BoardView(scene, 30, gvContext);
    }

    /** @param {number} deltaTime */
    update(deltaTime) {
        this.#boardDeco.update();
        this.#boardView.update();
        // let rad = Math.atan2((this.#boardContainer.y - 360) / 15, (this.#boardContainer.x - 540) / 50);
        // rad += 0.1;
        // this.#boardContainer.x = 540 + Math.cos(rad) * 50;
        // this.#boardContainer.y = 360 + Math.sin(rad) * 15;
    }
}
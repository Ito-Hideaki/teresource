import { BoardView } from "./boardview";
import { BoardDeco } from "./boarddeco";
import { GameViewContext } from "../infra/context";
import { PlayScene } from "../../play";
import { MinoQueueView } from "./subminoview";

/** Represents the game view for each player */
export class ViewController {
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
     */
    constructor(scene, gvContext) {
        this.#boardContainer = gvContext.boardContainer;
        this.#boardDeco = new BoardDeco(scene, 30, gvContext);
        this.#boardView = new BoardView(scene, 30, gvContext);
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
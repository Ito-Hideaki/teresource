import Phaser from "phaser";
import { Board, BoardSize } from "./mechanics";
import { BoardView, BoardViewSettings } from "./boardview";
import { BoardDeco } from "./boarddeco";
import { CurrentMinoManager } from "./minomanager";

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

    /** @param {Phaser.Scene} scene
     * @param {{
     *     boardSize: BoardSize,
     *     board: Board,
     *     currentMinoManager: CurrentMinoManager
     * }} $
     */
    constructor(scene, $) {
        this.#boardContainer = scene.add.container();
        this.#boardDeco = new BoardDeco(scene, 30, $.boardSize, this.#boardContainer);
        this.#boardView = new BoardView(scene, 30, {
            board: $.board,
            currentMinoManager: $.currentMinoManager,
            boardContainer: this.#boardContainer,
            boardViewSettings: new BoardViewSettings({ })
        });
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
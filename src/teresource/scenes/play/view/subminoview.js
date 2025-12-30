import Phaser from "phaser";
import { BoardSize } from "../core/mechanics";
import { CellImage, ImageBoard } from "./cellimage";
import { GameViewContext } from "../infra/context";
import { getRelativeX, getRelativeY } from "#util";

const subMinoViewBoardSize = new BoardSize(10, 10);

class SubMinoView {
    /** @type {ImageBoard} */ #imageBoard
    /** @type {Phaser.GameObjects.Container} */ #container

    /** @param {Phaser.Scene} scene @param {number} cellWidth @param {GameViewContext} context */
    constructor(scene, cellWidth, context) {
        this.#initContainer(scene, cellWidth, context);
        this.#initImageBoard(scene, cellWidth, context);
    }

    /** @param {Phaser.Scene} scene @param {number} cellWidth @param {GameViewContext} context */
    #initContainer(scene, cellWidth, context) {
        this.#container = scene.add.container();
        context.boardContainer.add(this.#container);
    }

    /** @param {Phaser.Scene} scene @param {number} cellWidth @param {GameViewContext} context */
    #initImageBoard(scene, cellWidth, context) {
        this.#imageBoard = new ImageBoard(subMinoViewBoardSize);
        const table = this.#imageBoard.table;

        for(let row = 0; row < this.#imageBoard.rowCount; row++) {
            for(let col = 0; col < this.#imageBoard.columnCount; col++) {
                const x = getRelativeX(col, cellWidth, subMinoViewBoardSize.columnCount);
                const y = getRelativeY(row, cellWidth, subMinoViewBoardSize.rowCount);
                table[row][col] = new CellImage(scene, x, y, context.cellSheetParent);
                this.#container.add(table[row][col]);
            }
        }
    }

    /** @param {Mino} mino */
    updateView(mino) {
        this.#imageBoard.table.forEach(row => row.forEach((/** @type {CellImage} */ cellImg) => {
            cellImg.setView({ color: "red", gobi: "n", skin: "skin" });
        }))
    }
}

export class MinoQueueView {

    #subMinoView

    /** @param {Phaser.Scene} scene @param {GameViewContext} context */
    constructor(scene, cellWidth, context) {
        this.minoQueue = context.gameContext.minoQueueManager.minoQueue;
        this.#subMinoView = new SubMinoView(scene, cellWidth, context);
    }

    update() {
        this.#subMinoView.updateView();
        if (import.meta.env.DEV) {
            const elm = document.getElementById("minoqueue");
            if (!elm) return;
            const minoCharStr = "ZLOSIJT";
            const nextQueueMino = this.minoQueue.slice(0, 5);
            const text = nextQueueMino.map(mino => minoCharStr[mino.type]).toString();
            document.getElementById("minoqueue").textContent = text;
        }


    }
}
import Phaser from "phaser";
import { BoardSize, Mino, Cell } from "../core/mechanics";
import { CellImage, ImageBoard } from "./cellimage";
import { GameViewContext } from "../infra/context";
import { createCellViewParamsFromCell } from "./celltexturecore";

const subMinoViewBoardSize = new BoardSize(10, 10);

/** @type {Object<string, { row: number, column: number}>} (0,0) means the top left point of the table, NOT THE CENTER OF THE TOP LEFT CELL */
const minoDisplayOrigin = {
    "z": { row: 1, column: 1.5 },
    "l": { row: 1, column: 1.5 },
    "o": { row: 1, column: 1 },
    "s": { row: 1, column: 1.5 },
    "i": { row: 1.5, column: 2 },
    "j": { row: 1, column: 1.5 },
    "t": { row: 1, column: 1.5 },
}

class SubMinoView {
    /** @type {ImageBoard} */ #imageBoard
    /** @type {Phaser.GameObjects.Container} */ #container
    /** @type {number} */ #cellWidth;
    /** @type {number} size width and height of the mino area*/ #size;
    /** @type {number} */ x = 0;
    /** @type {number} */ y = 0;
    #getRelativeCellImgX = (column => column * this.#cellWidth);
    #getRelativeCellImgY = (row => row * this.#cellWidth);

    /** @param {Phaser.Scene} scene @param {number} size width and height of the mino area @param {GameViewContext} context */
    constructor(scene, size, context) {
        this.#cellWidth = 30;
        this.#size = size;

        this.#initContainer(scene, context);
        this.#initImageBoard(scene, context);
    }

    /** @param {Phaser.Scene} scene @param {number} size @param {GameViewContext} context */
    #initContainer(scene, context) {
        this.#container = scene.add.container();
        context.boardContainer.add(this.#container);
    }

    /** @param {Phaser.Scene} scene @param {GameViewContext} context */
    #initImageBoard(scene, context) {
        this.#imageBoard = new ImageBoard(subMinoViewBoardSize);
        const table = this.#imageBoard.table;

        for (let row = 0; row < this.#imageBoard.rowCount; row++) {
            for (let col = 0; col < this.#imageBoard.columnCount; col++) {
                const x = this.#getRelativeCellImgX(col);
                const y = this.#getRelativeCellImgY(row);
                table[row][col] = new CellImage(scene, x, y, context.cellSheetParent, this.#cellWidth);
                this.#container.add(table[row][col]);
            }
        }
    }

    /** @param {Mino} mino */
    updateView(mino = undefined) {
        if (mino) {
            this.#container.setVisible(true);
            //update cellImg
            const { table } = mino.convertToTable({ isActive: true });
            this.#imageBoard.table.forEach((arr, row) => arr.forEach((/** @type {CellImage} */ cellImg, col) => {
                let cell;
                if (row < table.length && col < table[0].length) {
                    cell = table[row][col];
                } else cell = new Cell(false);
                cellImg.setView(createCellViewParamsFromCell(cell));
            }));
            //set container scale
            const cellSizeFactor = 1 / Math.max(mino.shape.size, 4); //  displayed cell width / mino area width
            const displayedCellWidth = this.#size * cellSizeFactor;
            const scale = displayedCellWidth / this.#cellWidth;
            this.#container.setScale(scale);
            //set container position
            const minoOrigin = minoDisplayOrigin[mino.type];
            const offsetX = this.#size * (0.5 - minoOrigin.column * cellSizeFactor);
            const offsetY = this.#size * (0.5 - minoOrigin.row * cellSizeFactor);
            this.#container.x = this.x + offsetX;
            this.#container.y = this.y + offsetY;
        } else {
            this.#container.setVisible(false);
        }
    }
}

class SubMinoBox {
    /** @type {SubMinoView} */ #subMinoView;
    /** @type {Phaser.GameObjects.Image} */ #image;
    /** @type {number} */#size;
    /** @type {number} */ #x = 0;
    set x(val) {
        this.#x = val;
    }
    get x() { return this.#x }
    /** @type {number} */ #y = 0;
    set y(val) {
        this.#y = val;
    }
    get y() { return this.#y }

    /** @param {Phaser.Scene} scene @param {number} size width and height of the whole view @param {GameViewContext} context */
    constructor(scene, size, context) {
        this.#size = size;
        this.#image = scene.add.image(0, 0, "subminoview_back");
        this.#image.setOrigin(0, 0);
        context.boardContainer.add(this.#image);
        this.#subMinoView = new SubMinoView(scene, size * 0.8, context);
    }

    /** @param {Mino} */
    updateView(mino = undefined) {
        //update minoview
        this.#subMinoView.x = this.#x + this.#size * 0.1;
        this.#subMinoView.y = this.#y + this.#size * 0.1;
        this.#subMinoView.updateView(mino);
        //update back image
        this.#image.displayWidth = this.#size;
        this.#image.displayHeight = this.#size;
        this.#image.x = this.#x;
        this.#image.y = this.#y;
    }
}

export class MinoQueueView {

    #subMinoBoxList
    minoQueue
    subMinoBoxList

    /** @param {Phaser.Scene} scene @param {GameViewContext} context */
    constructor(scene, context) {
        this.minoQueue = context.gameContext.minoQueueManager.minoQueue;
        this.#subMinoBoxList = [];
        let subMinoBoxYOffset = 0;
        for (let i = 0; i < 5; i++) {
            const size = 90;
            const subMinoBox = new SubMinoBox(scene, size, context);
            subMinoBox.x = context.getRelativeBoardX(context.gameContext.boardSize.columnCount) + 10;
            subMinoBox.y = context.getRelativeBoardY(20) + subMinoBoxYOffset;
            this.#subMinoBoxList.push(subMinoBox);
            subMinoBoxYOffset += size + 3;
        }
    }

    update() {
        this.#subMinoBoxList.forEach((subMinoBox, i) => subMinoBox.updateView(this.minoQueue[i]));
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

export class HeldMinoView {
    #subMinoBox
    #heldMinoManager

    /** @param {Phaser.Scene} scene @param {GameViewContext} context */
    constructor(scene, context) {
        const size = 90;
        this.#subMinoBox = new SubMinoBox(scene, size, context);
        this.#subMinoBox.x = context.getRelativeBoardX(0) - 10 - size;
        this.#subMinoBox.y = context.getRelativeBoardY(20);
        this.#heldMinoManager = context.gameContext.heldMinoManager;
    }

    update() {
        this.#subMinoBox.updateView(this.#heldMinoManager.getMino());
    }
}
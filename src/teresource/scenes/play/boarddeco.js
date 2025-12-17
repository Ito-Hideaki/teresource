import Phaser from "phaser";
import { UniqueTextureKeyGenerator, getRelativeX, getRelativeY } from "#util";
import { GameViewContext } from "./context";
import { BoardSize } from "./mechanics";

const utkg = new UniqueTextureKeyGenerator("boarddeco");

/** Draw a part which is not affected by board state */
export class BoardDeco {

    /**
     * Stroke board background grids, centered at (0,0).
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} cellWidth
     * @param {number} rowCount
     * @param {number} columnCount
     */
    static #strokeGrid(ctx, cellWidth, rowCount, columnCount) {

        ctx.strokeStyle = "#323232ff";
        ctx.lineWidth = cellWidth / 10;

        //top: row = 0 & y = -30; bottom: row = 39 & y = 9;
        for (let row = 0; row <= rowCount; row++) {
            const rowY = getRelativeY(row, cellWidth, rowCount);
            ctx.beginPath();
            ctx.moveTo(getRelativeX(0, cellWidth, columnCount), rowY);
            ctx.lineTo(getRelativeX(columnCount, cellWidth, columnCount), rowY);
            ctx.stroke();
        }

        //left: column = 0 & x = -5; right: column = 10 & x = 5;
        for (let column = 0; column <= columnCount; column++) {
            const cellX = getRelativeX(column, cellWidth, columnCount);
            ctx.beginPath();
            ctx.moveTo(cellX, getRelativeY(0, cellWidth, rowCount));
            ctx.lineTo(cellX, getRelativeY(rowCount, cellWidth, rowCount));
            ctx.stroke();
        }

        ctx.beginPath();
    }

    static #fillBackground(ctx, cellWidth, rowCount, columnCount) {
        ctx.fillStyle = "#000";
        ctx.fillRect(
            getRelativeX(0, cellWidth, columnCount),
            getRelativeY(0, cellWidth, rowCount),
            cellWidth * columnCount,
            cellWidth * rowCount
        );
    }

    /** @type {BoardSize} */
    #boardSize;
    #cellWidth;
    /** @type {Phaser.GameObjects.Image} */
    #image;
    #scene;
    #boardContainer;

    get #boardWidth() {
        return this.#cellWidth * this.#boardSize.rowCount;
    }

    set x(num) {
        this.#image.x = num;
    }

    set y(num) {
        this.#image.y = num;
    }

    /**
     * @param {Phaser.Scene} scene
     * @param { GameViewContext } gvContext
     */
    constructor(scene, cellWidth, gvContext) {
        const gContext = gvContext.gameContext;
        this.#scene = scene;
        this.#cellWidth = cellWidth;
        this.#boardSize = gContext.boardSize;
        this.#boardContainer = gvContext.boardContainer;

        this.#init();
    }

    #init() {
        //Create image
        const canvasTextureKey = utkg.get();
        this.#scene.textures.createCanvas(canvasTextureKey, this.#boardWidth * 1.25, this.#boardWidth * 2.25);
        this.#image = this.#scene.add.image(0, 0, canvasTextureKey);
        this.#boardContainer.add(this.#image);

        /** @type HTMLCanvasElement */
        const canvas = this.#image.texture.canvas;
        /** @type CanvasRenderingContext2D */
        const ctx = canvas.getContext("2d");

        ctx.clearRect(-10, -10, 10000, 100000);

        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);

        BoardDeco.#fillBackground(ctx, this.#cellWidth, 20, this.#boardSize.columnCount);
        BoardDeco.#strokeGrid(ctx, this.#cellWidth, 20, this.#boardSize.columnCount);

        ctx.restore();

        this.#image.texture.refresh();
    }

    update() {

    }
}
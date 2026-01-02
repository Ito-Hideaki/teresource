import Phaser from "phaser";
import { UniqueTextureKeyGenerator } from "#util";
import { GameViewContext } from "../infra/context";
import { BoardSize } from "../core/mechanics";

const utkg = new UniqueTextureKeyGenerator("boarddeco");

/** @typedef {{}} BoardDecoConfig */

/** Draw a part which is not affected by board state */
export class BoardDeco {

    /** @type {Function} */
    #getRelativeX;
    /** @type {Function} */
    #getRelativeY;

    /** @type {BoardSize} */
    #boardSize;
    #cellWidth;
    /** @type {Phaser.GameObjects.Image} */
    #image;
    #scene;
    #boardContainer;
    /** @type {BoardDecoConfig} */ #config;

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
     * @param {BoardDecoConfig} config
     */
    constructor(scene, cellWidth, gvContext, config) {
        const gContext = gvContext.gameContext;
        this.#scene = scene;
        this.#cellWidth = cellWidth;
        this.#boardSize = gContext.boardSize;
        this.#boardContainer = gvContext.boardContainer;
        this.#getRelativeX = gvContext.getRelativeBoardX;
        this.#getRelativeY = gvContext.getRelativeBoardY;
        this.#config = config;
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

        this.#fillBackground(ctx, this.#boardSize.rowCount, 0);
        this.#strokeGrid(ctx, this.#boardSize.rowCount, 0);

        ctx.restore();

        this.#image.texture.refresh();
    }

    /**
     * Stroke board background grids, centered at (0,0).
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} rowCount
     * @param {number} rowToDisplayFrom
     */
    #strokeGrid(ctx, rowCount, rowToDisplayFrom) {
        const columnCount = this.#boardSize.columnCount;
        const cellWidth = this.#cellWidth;
        ctx.strokeStyle = "#323232ff";
        ctx.lineWidth = cellWidth / 10;

        //horizontal lines
        for (let row = rowToDisplayFrom; row <= rowToDisplayFrom + rowCount; row++) {
            const rowY = this.#getRelativeY(row);
            ctx.beginPath();
            ctx.moveTo(this.#getRelativeX(0), rowY);
            ctx.lineTo(this.#getRelativeX(columnCount), rowY);
            ctx.stroke();
        }

        //vertical lines
        for (let column = 0; column <= columnCount; column++) {
            const cellX = this.#getRelativeX(column);
            ctx.beginPath();
            ctx.moveTo(cellX, this.#getRelativeY(rowToDisplayFrom));
            ctx.lineTo(cellX, this.#getRelativeY(rowToDisplayFrom + rowCount));
            ctx.stroke();
        }

        ctx.beginPath();
    }

    /**
     * Fill board background, centered at (0,0).
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} rowCount
     * @param {number} rowToDisplayFrom
     */
    #fillBackground(ctx, rowCount, rowToDisplayFrom) {
        const columnCount = this.#boardSize.columnCount;
        ctx.fillStyle = "#000";
        ctx.fillRect(
            this.#getRelativeX(0),
            this.#getRelativeY(rowToDisplayFrom),
            this.#getRelativeX(columnCount) - this.#getRelativeX(0),
            this.#getRelativeY(rowCount) - this.#getRelativeY(0),
        );
    }

    update() {

    }
}
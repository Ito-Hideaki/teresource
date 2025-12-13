import Phaser from "phaser";
import { UniqueTextureKeyGenerator, getRelativeX, getRelativeY } from "../../util";
import { Cell, CellBoard } from "./mechanics";
import { CurrentMinoManager } from "./minomanager";
import { generateCellTextureKey, cellImgSkins, cellGraphicSkins } from "./viewmechanics";
import { GameContext } from "./context";

const utkg = new UniqueTextureKeyGenerator("boardview");

export class BoardViewSettings {
    #settings = {
        skin: "default"
    }
    constructor($ = {}) {
        Object.assign(this.#settings, $);
    }
    get(key) {
        return this.#settings[key];
    }
}

/** Draws all the cells of the board */
export class BoardView {

    /**
     *
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} x left coordinate of the cell
     * @param {number} y top coordinate of the cell
     * @param {number} cellWidth
     * @param {Cell} cell
     */
    static #fillCellWithRect(ctx, x, y, cellWidth, cell) {
        const colorCodes = [
            "#f22",
            "#f91",
            "#ff1",
            "#5f1",
            "#1ff",
            "#13f",
            "#a1f",
            "#888",
            "#111",
            "#0000",
        ]
        const inactiveColorCodes = [
            "rgba(212, 26, 26, 1)",
            "rgba(212, 130, 22, 1)",
            "rgba(213, 213, 22, 1)",
            "rgba(77, 212, 24, 1)",
            "rgba(23, 215, 215, 1)",
            "rgba(27, 54, 212, 1)",
            "rgba(149, 25, 215, 1)",
            "#888",
            "#111",
            "#0000",
        ]
        if (cell.isBlock) {
            if (cell.isActive) {
                ctx.fillStyle = colorCodes[cell.color];
            } else {
                ctx.fillStyle = inactiveColorCodes[cell.color];
            }
            ctx.fillRect(x, y, cellWidth, cellWidth);
        }
    }




    /** Draws the board graphics. @type Phaser.GameObjects.Image */
    #image
    #cellWidth
    /** @type {CellBoard} */
    #cellBoard
    #scene
    /** @type {CurrentMinoManager} */
    #currentMinoManager
    #boardContainer
    /** @type {BoardViewSettings} */
    #boardViewSettings

    get #boardWidth() {
        return this.#cellWidth * this.#cellBoard.rowCount;
    }

    /** @param {number} num */
    set x(num) {
        this.#image.x = num;
    }
    /** @param {number} num */
    set y(num) {
        this.#image.y = num;
    }

    /**
     *  @param { Phaser.Scene } scene
     *  @param { number } cellWidth
     *  @param { GameContext } gContext
     *  @param { {
     * boardContainer: Phaser.GameObjects.Container,
     * boardViewSettings: BoardViewSettings
     * } } $
    */
    constructor(scene, cellWidth, gContext, $) {
        this.#scene = scene;
        this.#cellWidth = cellWidth;
        this.#cellBoard = gContext.cellBoard;
        this.#currentMinoManager = gContext.currentMinoManager;
        this.#boardContainer = $.boardContainer;
        this.#boardViewSettings = $.boardViewSettings;

        this.#init();
    }

    #init() {
        //Create image
        const canvasTextureKey = utkg.get();
        this.#scene.textures.createCanvas(canvasTextureKey, this.#boardWidth * 1.25, this.#boardWidth * 2.25);
        this.#image = this.#scene.add.image(0, 0, canvasTextureKey);
        this.#boardContainer.add(this.#image);
    }

    /**Draw cell with image
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} x
     * @param {number} y
     * @param {Cell} cell
    */
    #fillCellImg(ctx, x, y, cell) {
        const scene = this.#scene;
        const cellWidth = this.#cellWidth;
        if (cell.isBlock) {
            const key = generateCellTextureKey({ color: cell.color, isActive: cell.isActive });
            const cellImg = scene.textures.get(key).getSourceImage();
            ctx.drawImage(cellImg, x, y, cellWidth, cellWidth);
        }
    }

    #fillCell(ctx, x, y, cell) {
        const skin = this.#boardViewSettings.get("skin");
        if (cellImgSkins.includes(skin)) {
            this.#fillCellImg(ctx, x, y, cell);
        } else if (cellGraphicSkins.includes(skin)) {
            if (skin === "rect") {
                BoardView.#fillCellWithRect(ctx, x, y, this.#cellWidth, cell);
            }
        } else {
            throw `Skin "${skin}" was not found`;
        }
    }

    /** Draw filling of the each block of the board.
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} cellWidth
     * @param {CellBoard} cellBoard
    */
    #fillBoard(ctx, cellWidth, cellBoard) {
        //top: row = 0 & y = -30; bottom: row = 39 & y = 9;
        for (let row = 0; row < cellBoard.rowCount; row++) {
            const y = getRelativeY(row, cellWidth, cellBoard.rowCount);
            //left: column = 0 & x = -5; right: column = 9 & x = 4;
            for (let column = 0; column < cellBoard.columnCount; column++) {
                const x = getRelativeX(column, cellWidth, cellBoard.columnCount);
                this.#fillCell(ctx, x, y, cellBoard.getCell(row, column));
            }
        }
    }

    update() {
        /** @type HTMLCanvasElement */
        const canvas = this.#image.texture.canvas;
        /** @type CanvasRenderingContext2D */
        const ctx = canvas.getContext("2d");

        /** duplicated board for drawing */
        const compositedBoard = (() => {
            if (this.#currentMinoManager.isPlaced) return this.#cellBoard.duplicate();
            const { table, topLeft } = this.#currentMinoManager.mino.convertToTable({ isActive: true });
            return this.#cellBoard.duplicate().compositeMinoTable(
                table,
                this.#currentMinoManager.row + topLeft.row,
                this.#currentMinoManager.column + topLeft.column
            );
        })();

        ctx.clearRect(-10, -10, 10000, 100000);

        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);

        this.#fillBoard(ctx, this.#cellWidth, compositedBoard);

        ctx.restore();

        this.#image.texture.refresh();
    }
}
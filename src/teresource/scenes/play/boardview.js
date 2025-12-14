import Phaser from "phaser";
import { UniqueTextureKeyGenerator, getRelativeX, getRelativeY } from "#util";
import { Board, BoardSize, Cell, CellBoard } from "./mechanics";
import { CurrentMinoManager } from "./minomanager";
import { generateCellTextureKey, cellImgSkins, cellGraphicSkins } from "./viewmechanics";
import { GameViewContext } from "./context";

const utkg = new UniqueTextureKeyGenerator("boardview");

class CellImage extends Phaser.GameObjects.Image {
    /** 
     * @param {Phaser.Scene} scene
     * @param {number} x
     * @param {number} y
     * @param {Phaser.Textures.Texture} texture
     */
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
    }
}

class ImageBoard extends Board {
    /** @type {CellImage[][]} */
    table;
    /** @param {BoardSize} boardSize */
    constructor(boardSize) {
        super(boardSize, () => undefined);
    }
}

/** Draws all the cells of the board */
export class BoardView {






    /** Draws the board graphics. @type Phaser.GameObjects.Image */
    #image
    #cellWidth
    /** @type {CellBoard} */
    #cellBoard
    #scene
    /** @type {CurrentMinoManager} */
    #currentMinoManager
    #boardContainer
    /** @type {string} */
    #skin

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
     *  @param { GameViewContext } gvContext
     *  @param { {
     * boardContainer: Phaser.GameObjects.Container,
     * } } $
    */
    constructor(scene, cellWidth, gvContext, $) {
        const gContext = gvContext.gameContext;
        this.#scene = scene;
        this.#cellWidth = cellWidth;
        this.#cellBoard = gContext.cellBoard;
        this.#currentMinoManager = gContext.currentMinoManager;
        this.#boardContainer = $.boardContainer;

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
        const skin = this.#skin;
        if (cellImgSkins.includes(skin)) {
            this.#fillCellImg(ctx, x, y, cell);
        } else if (cellGraphicSkins.includes(skin)) {
            if (skin === "rect") {
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
    }
}
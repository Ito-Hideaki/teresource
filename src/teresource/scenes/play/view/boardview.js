import Phaser from "phaser";
import { getRelativeX, getRelativeY } from "#util";
import { Cell, CellBoard } from "../core/mechanics";
import { CurrentMinoManager } from "../core/minomanager";
import { generateCellTextureKey, cellImgSkins, cellGraphicSkins, createCellViewParamsFromCell } from "./viewmechanics";
import { GameViewContext, GameContext } from "../infra/context";
import { ImageBoard, CellImage } from "./cellimage";

/** Draws all the cells of the board */
export class BoardView {





    #image
    /** Board of Cell images. @type {ImageBoard} */
    #imageBoard
    #cellWidth
    /** @type {CellBoard} */
    #cellBoard
    #scene
    /** @type {CurrentMinoManager} */
    #currentMinoManager
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
    */
    constructor(scene, cellWidth, gvContext) {
        /** @type {GameContext} */
        const gContext = gvContext.gameContext;
        this.#scene = scene;
        this.#cellWidth = cellWidth;
        this.#cellBoard = gContext.cellBoard;
        this.#currentMinoManager = gContext.currentMinoManager;

        this.#initImageBoard(scene, cellWidth, gvContext);
    }

    /**
     *  @param { Phaser.Scene } scene
     *  @param { number } cellWidth
     *  @param { GameViewContext } gvContext
     */
    #initImageBoard(scene, cellWidth, gvContext) {
        //Create imageBoard
        const boardSize = gvContext.gameContext.boardSize;
        this.#imageBoard = new ImageBoard(boardSize);
        this.#imageBoard.table.forEach((array, row) => {
            array.forEach((_, column) => {
                //generate cellImage for each cell of the board
                const x = getRelativeX(column, cellWidth, boardSize.columnCount);
                const y = getRelativeY(row, cellWidth, boardSize.rowCount);
                const cellImage = new CellImage(scene, x, y, gvContext.cellSheetParent);
                this.#imageBoard.table[row][column] = cellImage;

                //add cellImage to scene and container
                scene.add.existing(cellImage);
                gvContext.boardContainer.add(cellImage);
            })
        })
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

        compositedBoard.table.forEach((array, row) => {
            array.forEach((/** @type {Cell} */cell, column) => {
                /** @type {CellImage} */
                const cellImage = this.#imageBoard.table[row][column];
                const cellViewParams = createCellViewParamsFromCell(cell);
                cellImage.setView(cellViewParams);
            });
        })
    }
}
import Phaser from "phaser";
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
    /** @type {Function} */
    #getRelativeX;
    /** @type {Function} */
    #getRelativeY;

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
        this.#getRelativeX = gvContext.getRelativeBoardX;
        this.#getRelativeY = gvContext.getRelativeBoardY;

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
                const x = this.#getRelativeX(column, cellWidth, boardSize.columnCount);
                const y = this.#getRelativeY(row, cellWidth, boardSize.rowCount);
                const cellImage = new CellImage(scene, x, y, gvContext.cellSheetParent);
                this.#imageBoard.table[row][column] = cellImage;

                //add cellImage to scene and container
                scene.add.existing(cellImage);
                gvContext.boardContainer.add(cellImage);
            })
        })
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
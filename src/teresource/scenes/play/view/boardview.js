import Phaser from "phaser";
import { Cell, CellBoard, BoardSize } from "../core/mechanics";
import { CurrentMinoManager } from "../core/minomanager";
import { createCellViewParamsFromCell } from "./celltexturecore";
import { GameViewContext, GameContext } from "../infra/context";
import { ImageBoard, CellImage } from "./cellimage";

/** @typedef {{ displayedBoardArea: BoardArea }} BoardViewConfig */

/** Draws all the cells of the board */
export class BoardView {

    /** Board of Cell images. @type {ImageBoard} */
    #imageBoard
    /** @type {CellBoard} */
    #cellBoard
    /** @type {CurrentMinoManager} */
    #currentMinoManager
    /** @type {Function} */
    #getRelativeX;
    /** @type {Function} */
    #getRelativeY;
    #displayedBoardArea;

    /**
     *  @param { Phaser.Scene } scene
     *  @param { GameViewContext } gvContext
     * @param { BoardViewConfig } config
    */
    constructor(scene, gvContext, config) {
        /** @type {GameContext} */
        const gContext = gvContext.gameContext;
        this.#cellBoard = gContext.cellBoard;
        this.#currentMinoManager = gContext.currentMinoManager;
        this.#getRelativeX = gvContext.getRelativeBoardX;
        this.#getRelativeY = gvContext.getRelativeBoardY;
        this.#displayedBoardArea = config.displayedBoardArea;

        this.#initImageBoard(scene, gvContext.getBoardCellWidth(), gvContext);
    }

    /**
     *  @param { Phaser.Scene } scene
     *  @param { number } cellWidth
     *  @param { GameViewContext } gvContext
     */
    #initImageBoard(scene, cellWidth, gvContext) {
        //Create imageBoard
        /** @type {BoardSize} */ const boardSize = gvContext.gameContext.boardSize;
        this.#imageBoard = new ImageBoard(boardSize);
        this.#imageBoard.table.forEach((array, row) => {
            array.forEach((_, column) => {
                //generate cellImage for each cell of the board
                const x = this.#getRelativeX(column, cellWidth, boardSize.columnCount);
                const y = this.#getRelativeY(row, cellWidth, boardSize.rowCount);
                const cellImage = new CellImage(scene, x, y, gvContext.cellSheetParent, cellWidth);
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
            if (row < this.#displayedBoardArea.topRow) {
                array.forEach((_, column) => {
                    /** @type {CellImage} */
                    const cellImage = this.#imageBoard.table[row][column];
                    const cellViewParams = createCellViewParamsFromCell(new Cell(false));
                    cellImage.setView(cellViewParams);
                });
            } else {
                array.forEach((/** @type {Cell} */cell, column) => {
                    /** @type {CellImage} */
                    const cellImage = this.#imageBoard.table[row][column];
                    const cellViewParams = createCellViewParamsFromCell(cell);
                    cellImage.setView(cellViewParams);
                });
            }
        })
    }
}
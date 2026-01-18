import { CurrentMinoManager, Bag, MinoQueueManager, HeldMinoManager } from "../core/minomanager";
import { BoardSize, CellBoard } from "../core/mechanics";
import { ControlOrderProvider, BoardUpdater, BoardUpdateState } from "../controller/boardcontroller";
import { GameContext, GameViewContext } from "./context";
import { GameViewController } from "../view/gameviewcontroller";
import { GameController } from "../controller/gamecontroller";
import { PlayScene } from "../../play";
import { RotationSystem_NoKick, RotationSystem_Standard } from "../core/rotationsystem";
import { BoardDeco } from "../view/boarddeco";
import { BoardView } from "../view/boardview";
import { MinoQueueView, HeldMinoView } from "../view/subminoview";
import { createRelativePositionGetter } from "#util";
import { GameEffectManagerView } from "../view/gameeffectview";
import { GameReportStack } from "../controller/report";
import { LineClearManager } from "../core/lineclear";

/** 
 * @typedef {{
 *    bag: import("../core/minomanager").BagConfig
 *    skin: string,
 *    handling: {
 *        DAS: number,
 *        ARR: number,
 *    }
 * }} GameConfig
 *  */

/** @param {GameConfig} gameConfig @return {import("../core/minomanager").BagConfig} */
function getBagConfig(gameConfig) {
    return gameConfig.bag;
}

/** @param {GameConfig} gameConfig @return {import("../controller/boardcontroller").ControlOrderProviderConfig} */
function getControlOrderProviderConfig(gameConfig) {
    return {
        DAS: gameConfig.handling.DAS,
        ARR: gameConfig.handling.ARR
    }
}

/**
 * @typedef {{
 *     boardCellWidth: number
 * }} GameViewConfig
 *  */

/** @param {GameViewConfig} gameViewConfig @return {import("./boarddeco").BoardDecoConfig} */
function getBoardDecoConfig(gameViewConfig) {
    return { boardCellWidth : gameViewConfig.boardCellWidth };
}

/** @param {GameViewConfig} gameViewConfig @return {import("./boardview").BoardViewConfig}*/
function getBoardViewConfig(gameViewConfig) {
    return { boardCellWidth : gameViewConfig.boardCellWidth };
}

export class GameFactory {

    /** @param {PlayScene} scene @param {GameConfig} gameConfig */
    static create(scene, gameConfig) {
        const boardSize = new BoardSize(40, 10);
        const currentMinoManager = new CurrentMinoManager();
        const cellBoard = new CellBoard(boardSize);
        const minoQueueManager = new MinoQueueManager(new Bag(Bag.TYPES.SEVEN, getBagConfig(gameConfig)));
        const heldMinoManager = new HeldMinoManager();
        const boardUpdateState = new BoardUpdateState();
        const gameReportStack = new GameReportStack();
        const gameContext = new GameContext({
            cellBoard, boardSize, currentMinoManager, minoQueueManager, heldMinoManager, boardUpdateState, gameReportStack, rotationSystem: new RotationSystem_Standard()
        });

        const lineClearManager = new LineClearManager(gameContext);
        const controlOrderProvider = new ControlOrderProvider(getControlOrderProviderConfig(gameConfig));
        const boardUpdater = new BoardUpdater(gameContext);
        const gameController = new GameController(gameContext, { boardUpdater, controlOrderProvider, lineClearManager });

        //Create elements of the scene
        const { gameViewController } = GameFactory.#createView({ gameConfig, gameContext, scene });

        return {
            gameController,
            gameContext,
            gameViewController,
            controlOrderProvider
        }
    }

    /** @param {{ gameConfig: GameConfig, gameContext: GameContext, scene: Phaser.Scene }} */
    static #createView({ gameConfig, gameContext, scene }) {
        const boardCellWidth = 26;
        const skin = gameConfig.skin;
        const boardContainer = scene.add.container();
        const relativeBoardPositionGetter = createRelativePositionGetter(boardCellWidth, 20, gameContext.boardSize.columnCount, -20, 0);
        const gameViewContext = new GameViewContext({
            cellSheetParent: scene.cellSheetParentIndex[skin],
            gameContext,
            boardContainer,
            getRelativeBoardX: relativeBoardPositionGetter.getRelativeX,
            getRelativeBoardY: relativeBoardPositionGetter.getRelativeY
        });

        /** @type {GameViewConfig} */ const gameViewConfig = { boardCellWidth };

        const boardDeco = new BoardDeco(scene, gameViewContext, getBoardDecoConfig(gameViewConfig));
        const boardView = new BoardView(scene, gameViewContext, getBoardViewConfig(gameViewConfig));
        const minoQueueView = new MinoQueueView(scene, gameViewContext);
        const heldMinoView = new HeldMinoView(scene, gameViewContext);
        const gameEffectManagerView = new GameEffectManagerView(scene, gameViewContext);
        const gameViewController = new GameViewController(scene, gameViewContext, {
            boardDeco, boardView, minoQueueView, heldMinoView, gameEffectManagerView
        }, gameViewConfig);
        gameViewController.x = scene.game.canvas.width / 2;
        gameViewController.y = scene.game.canvas.height / 2;

        return { gameViewController };
    }
}
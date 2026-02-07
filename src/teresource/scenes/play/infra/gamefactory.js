import { CurrentMinoManager, Bag, MinoQueueManager, HeldMinoManager } from "../core/minomanager";
import { BoardSize, CellBoard } from "../core/mechanics";
import { ControlOrderProvider, BoardUpdater, BoardUpdateState } from "../controller/boardcontroller";
import { GameContext, GameHighContext, GameViewContext } from "./context";
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
import { GameAttackState } from "../core/attack";
import { GameStatsManager, GameStats } from "../controller/stats";
import { GameStatsView } from "../view/gamestatsview";

/** 
 * @typedef {{
 *    bag: import("../core/minomanager").BagConfig
 *    personalization: {
 *        skin: string
 *    },
 *    boardWidth: number,
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
        const boardSize = new BoardSize(40, gameConfig.boardWidth);
        const currentMinoManager = new CurrentMinoManager(Math.ceil(boardSize.columnCount / 2) - 1);
        const cellBoard = new CellBoard(boardSize);
        const minoQueueManager = new MinoQueueManager(new Bag(Bag.TYPES.SEVEN, getBagConfig(gameConfig)));
        const heldMinoManager = new HeldMinoManager();
        const boardUpdateState = new BoardUpdateState();
        const gameReportStack = new GameReportStack();
        const gameContext = new GameContext({
            cellBoard, boardSize, currentMinoManager, minoQueueManager, heldMinoManager, boardUpdateState, gameReportStack, rotationSystem: new RotationSystem_Standard()
        });

        const lineClearManager = new LineClearManager(gameContext);
        const gameAttackState = new GameAttackState(gameContext);
        const controlOrderProvider = new ControlOrderProvider(getControlOrderProviderConfig(gameConfig));
        const gameStats = new GameStats();
        const gameStatsManager = new GameStatsManager(gameStats);
        const gameHighContext = new GameHighContext({
            gameStats, gameStatsManager, gameAttackState, controlOrderProvider, lineClearManager
        })
        const gameController = new GameController(gameContext, gameHighContext);

        //Create elements of the scene
        const { gameViewController } = GameFactory.#createView({ gameConfig, gameHighContext, gameContext, scene });

        return {
            gameController,
            gameContext,
            gameViewController,
            controlOrderProvider
        }
    }

    /** @param {{ gameConfig: GameConfig, gameHighContext: GameHighContext, gameContext: GameContext, scene: Phaser.Scene }} */
    static #createView({ gameConfig, gameContext, gameHighContext, scene }) {
        const boardCellWidth = 26;
        const skin = gameConfig.personalization.skin;
        const boardContainer = scene.add.container();
        const relativeBoardPositionGetter = createRelativePositionGetter(boardCellWidth, 20, gameContext.boardSize.columnCount, -20, 0);
        const gameViewContext = new GameViewContext({
            cellSheetParent: scene.cellSheetParentIndex[skin],
            gameContext,
            gameHighContext,
            boardContainer,
            getRelativeBoardX: relativeBoardPositionGetter.getRelativeX,
            getRelativeBoardY: relativeBoardPositionGetter.getRelativeY,
            getBoardCellWidth: () => boardCellWidth,
        });

        /** @type {GameViewConfig} */ const gameViewConfig = { boardCellWidth };

        const boardDeco = new BoardDeco(scene, gameViewContext, getBoardDecoConfig(gameViewConfig));
        const boardView = new BoardView(scene, gameViewContext, getBoardViewConfig(gameViewConfig));
        const minoQueueView = new MinoQueueView(scene, gameViewContext);
        const heldMinoView = new HeldMinoView(scene, gameViewContext);
        const gameEffectManagerView = new GameEffectManagerView(scene, gameViewContext);
        const gameStatsView = new GameStatsView(scene, gameViewContext);
        const gameViewController = new GameViewController(scene, gameViewContext, {
            boardDeco, boardView, minoQueueView, heldMinoView, gameEffectManagerView, gameStatsView
        }, gameViewConfig);
        gameViewController.x = scene.game.canvas.width / 2;
        gameViewController.y = scene.game.canvas.height / 2;

        return { gameViewController };
    }
}
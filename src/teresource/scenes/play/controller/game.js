import { CurrentMinoManager, Bag, MinoQueueManager, HeldMinoManager } from "../core/minomanager";
import { BoardSize, CellBoard } from "../core/mechanics";
import { ControlOrderProvider, BoardUpdater, BoardUpdateState } from "./boardcontroller";
import { GameContext, GameHighContext, GameViewContext } from "../infra/context";
import { GameViewController } from "../view/gameviewcontroller";
import { GameUpdator } from "./gameupdator";
import { PlayScene } from "../../play";
import { RotationSystem_NoKick, RotationSystem_Standard } from "../core/rotationsystem";
import { BoardDeco } from "../view/boarddeco";
import { BoardView } from "../view/boardview";
import { MinoQueueView, HeldMinoView } from "../view/subminoview";
import { createRelativePositionGetter } from "#util";
import { GameEffectManagerView } from "../view/gameeffectview";
import { GameReportStack } from "./report";
import { LineClearManager } from "../core/lineclear";
import { GameAttackState } from "../core/attack";
import { GameStatsManager, GameStats } from "./stats";
import { GameStatsView } from "../view/gamestatsview";
import { GameScheduledDamageState, GarbageGenerator, LinearDamageProvider } from "../core/garbage";

/** 
 * @typedef {{
 *  bag: import("../core/minomanager").BagConfig
 *  personalization: {
 *      skin: string
 *  },
 *  boardWidth: number,
 *  boardHeight: number,
 *  startLevel: number,
 *  gravityPowerBase: number,
 *  garbage: import("../core/garbage").GarbageConfig,
 *  handling: {
 *      DAS: number,
 *      ARR: number,
 *  },
 *  autoDamage: import("./gameupdator").AutoDamageConfig
 * }} GameConfig
 *  */

/** @param {GameConfig} gameConfig @return {import("../core/minomanager").BagConfig} */
function getBagConfig(gameConfig) {
    return gameConfig.bag;
}

/** @param {GameConfig} gameConfig @return {import("./boardcontroller").ControlOrderProviderConfig} */
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

export class SingleGame {

    /** @param {PlayScene} scene @param {GameConfig} gameConfig */
    constructor(scene, gameConfig) {
        const boardSize = new BoardSize(gameConfig.boardHeight * 2, gameConfig.boardWidth);
        const currentMinoManager = new CurrentMinoManager(
            boardSize.rowCount - gameConfig.boardHeight,
            Math.ceil(boardSize.columnCount / 2) - 1
        );
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
        const garbageGenerator = new GarbageGenerator(cellBoard, gameConfig.garbage);
        const scheduledDamageState = new GameScheduledDamageState();
        const controlOrderProvider = new ControlOrderProvider(getControlOrderProviderConfig(gameConfig));
        const gameStats = new GameStats();
        const gameStatsManager = new GameStatsManager(gameStats, gameConfig.startLevel);
        const gameHighContext = new GameHighContext({
            gameStats, gameStatsManager, gameAttackState, controlOrderProvider, lineClearManager,  garbageGenerator, scheduledDamageState
        })
        const gameUpdator = new GameUpdator(gameContext, gameHighContext, gameConfig.gravityPowerBase);

        const damageProviderPerMino = new LinearDamageProvider(gameConfig.autoDamage.attackPerMino, gameConfig.autoDamage.attackDamage);

        //Create elements of the scene
        const { gameViewController } = this.#createView({ gameConfig, gameHighContext, gameContext, scene });

        this.gameUpdator = gameUpdator;
        this.gameContext = gameContext;
        this.gameViewController = gameViewController;
        this.controlOrderProvider = controlOrderProvider;
        this.damageProviderPerMino = damageProviderPerMino;
    }

    /** @param {{ gameConfig: GameConfig, gameHighContext: GameHighContext, gameContext: GameContext, scene: Phaser.Scene }} */
    #createView({ gameConfig, gameContext, gameHighContext, scene }) {
        const boardCellWidth = 26 / Math.max(gameConfig.boardHeight / 20, gameConfig.boardWidth / 20);
        const skin = gameConfig.personalization.skin;
        const boardContainer = scene.add.container();
        const relativeBoardPositionGetter = createRelativePositionGetter(
            boardCellWidth, //cell width
            gameConfig.boardHeight, //displayed board row count
            gameContext.boardSize.columnCount, //displayed board column count
            gameConfig.boardHeight - gameContext.boardSize.rowCount, //row offset
            0 //column offset
        );
        const gameViewContext = new GameViewContext({
            cellSheetParent: scene.cellSheetParentIndex[skin],
            gameContext,
            gameHighContext,
            boardContainer,
            getRelativeBoardX: relativeBoardPositionGetter.getRelativeX,
            getRelativeBoardY: relativeBoardPositionGetter.getRelativeY,
            getBoardCellWidth: () => boardCellWidth,
            displayedBoardArea: { topRow: gameContext.boardSize.rowCount - gameConfig.boardHeight }
        });

        const boardDeco = new BoardDeco(scene, gameViewContext, {  });
        const boardView = new BoardView(scene, gameViewContext, { displayedBoardArea: { topRow: 0 } });
        const minoQueueView = new MinoQueueView(scene, gameViewContext);
        const heldMinoView = new HeldMinoView(scene, gameViewContext);
        const gameEffectManagerView = new GameEffectManagerView(scene, gameViewContext, skin);
        const gameStatsView = new GameStatsView(scene, gameViewContext);
        const gameViewController = new GameViewController(scene, gameViewContext, {
            boardDeco, boardView, minoQueueView, heldMinoView, gameEffectManagerView, gameStatsView
        });

        return { gameViewController };
    }
}
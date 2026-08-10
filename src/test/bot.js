import Phaser from "phaser";
import { BootloaderScene } from "../teresource/scenes/bootloader";
import { createConfigUIElement } from "../teresource/configUI";
import { createLogBox } from "../teresource/logUI";
import { CurrentMinoManager, Bag, MinoQueueManager, HeldMinoManager } from "../teresource/scenes/play/core/minomanager";
import { BoardSize, Cell, CellBoard } from "../teresource/scenes/play/core/mechanics";
import { BoardUpdater, BoardUpdateState } from "../teresource/scenes/play/controller/boardcontroller";
import { ControlOrderGateway } from "../teresource/scenes/play/controller/controlorder";
import { GameContext, GameHighContext, GameViewContext } from "../teresource/scenes/play/infra/context";
import { GameViewController } from "../teresource/scenes/play/view/gameviewcontroller";
import { GameUpdator } from "../teresource/scenes/play/controller/gameupdator";
import { RotationSystem_NoKick, RotationSystem_Standard } from "../teresource/scenes/play/core/rotationsystem";
import { BoardDeco } from "../teresource/scenes/play/view/boarddeco";
import { BoardView } from "../teresource/scenes/play/view/boardview";
import { MinoQueueView, HeldMinoView } from "../teresource/scenes/play/view/subminoview";
import { createRelativePositionGetter } from "#util";
import { GameEffectManagerView } from "../teresource/scenes/play/view/gameeffectview";
import { GameReportStack } from "../teresource/scenes/play/controller/report";
import { LineClearManager } from "../teresource/scenes/play/core/lineclear";
import { GameAttackState } from "../teresource/scenes/play/core/attack";
import { GameStatsManager, GameStats } from "../teresource/scenes/play/controller/stats";
import { GameStatsView } from "../teresource/scenes/play/view/gamestatsview";
import { GameScheduledDamageState, GarbageGenerator, LinearDamageProvider } from "../teresource/scenes/play/core/garbage";
import { ScheduledDamageView } from "../teresource/scenes/play/view/scheduleddamageview";
import { MINO_DATA_INDEX } from "../teresource/scenes/play/core/coredata";
import { TYPICAL_GAME_CONFIG } from "../teresource/scenes/play/controller/game";
import { GameSession } from "../teresource/scenes/play/controller/gamesession";
import { createTBPHandler } from "../teresource/scenes/play/bot/handler";

class MenuScene extends Phaser.Scene {
    constructor() {
        super("menu");
    }

    create() {
        this.scene.start("play");
    }
}

class SingleGameCustomed {

    #gameReportStack;

    /** @param {Phaser.Scene} scene @param { ControlOrderGateway } controlOrderGateway */
    constructor(scene, controlOrderGateway) {
        const gameConfig = TYPICAL_GAME_CONFIG;
        const boardSize = new BoardSize(gameConfig.boardHeight * 2, gameConfig.boardWidth);
        const currentMinoManager = new CurrentMinoManager(
            boardSize.rowCount - gameConfig.boardHeight,
            Math.ceil(boardSize.columnCount / 2) - 1
        );
        const cellBoard = new CellBoard(boardSize);
        this.cellBoard = cellBoard;

        const minoQueueManager = new MinoQueueManager(new Bag(Bag.TYPES.SEVEN, gameConfig.bag));
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
        const gameStats = new GameStats();
        const gameStatsManager = new GameStatsManager(gameStats, gameConfig.startLevel);
        const gameHighContext = new GameHighContext({
            gameStats, gameStatsManager, gameAttackState, lineClearManager,  garbageGenerator, scheduledDamageState
        })

        const damageProviderPerMino = new LinearDamageProvider(gameConfig.autoDamage.attackPerMino, gameConfig.autoDamage.attackDamage);

        const gameUpdator = new GameUpdator(gameContext, gameHighContext, gameConfig.gravityPowerBase, { damageProviderPerMino }, controlOrderGateway);

        //Create elements of the scene
        const { gameViewController } = this.#createView({ gameConfig, gameHighContext, gameContext, scene });

        this.#gameReportStack = gameReportStack;

        this.gameUpdator = gameUpdator;
        this.gameContext = gameContext;
        this.gameHighContext = gameHighContext;
        this.gameViewController = gameViewController;
    }

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
        const scheduledDamageView = new ScheduledDamageView(scene, gameViewContext);
        const gameViewController = new GameViewController(scene, gameViewContext, {
            boardDeco, boardView, minoQueueView, heldMinoView, gameEffectManagerView, gameStatsView, scheduledDamageView
        });

        return { gameViewController };
    }

    renewReport() {
        this.#gameReportStack.renewAll();
    }

    /** @param { (import("../teresource/scenes/play/core/coredata").MinoType|"_")[][] } minoTypeTable */
    setBoardTable(minoTypeTable) {
        this.cellBoard.table.forEach((row, i) => {
            row.forEach((cell, j) => {
                const color = minoTypeTable[i][j];
                const newCell = color === "_" ? new Cell(false) : new Cell(true, MINO_DATA_INDEX[color].color);
                this.cellBoard.table[i][j] = newCell;
            });
        });
    }
}

class PlayScene extends Phaser.Scene {
    constructor() {
        super("play");
    }

    create() {
        this.cellSheetParentIndex = this.game.cellSheetParentIndex;
        const controlOrderGateway = new ControlOrderGateway();
        this.singleGame = new SingleGameCustomed(this, controlOrderGateway);
        const container = this.singleGame.gameViewController.boardContainer;
        container.x = this.game.canvas.width / 2;
        container.y = this.game.canvas.height / 2;
        this.singleGame.gameUpdator.setSessionFromConfig(GameSession.SessionType.None);

        this.singleGame.setBoardTable([
            ["_","_","_","_","_","_","_","_","_","_"],
            ["_","_","_","_","_","_","_","_","_","_"],
            ["_","_","_","_","_","_","_","_","_","_"],
            ["_","_","_","_","_","_","_","_","_","_"],
            ["_","_","_","_","_","_","_","_","_","_"],
            ["_","_","_","_","_","_","_","_","_","_"],
            ["_","_","_","_","_","_","_","_","_","_"],
            ["_","_","_","_","_","_","_","_","_","_"],
            ["_","_","_","_","_","_","_","_","_","_"],
            ["_","_","_","_","_","_","_","_","_","_"],
            ["_","_","_","_","_","_","_","_","_","_"],
            ["_","_","_","_","_","_","_","_","_","_"],
            ["_","_","_","_","_","_","_","_","_","_"],
            ["_","_","_","_","_","_","_","_","_","_"],
            ["_","_","_","_","_","_","_","_","_","_"],
            ["_","_","_","_","_","_","_","_","_","_"],
            ["_","_","_","_","_","_","_","_","_","_"],
            ["_","_","_","_","_","_","_","_","_","_"],
            ["_","_","_","_","_","_","_","_","_","_"],
            ["_","_","_","_","_","_","_","_","_","_"],
            ["_","_","_","_","_","_","_","_","_","_"],
            ["_","_","_","_","_","_","_","_","_","_"],
            ["_","_","_","_","_","_","_","_","_","_"],
            ["_","_","_","_","_","_","_","_","_","_"],
            ["_","_","_","_","_","_","_","_","_","_"],
            ["_","_","_","_","_","_","_","_","_","_"],
            ["_","_","_","_","_","_","_","_","_","_"],
            ["_","_","_","_","_","_","_","_","_","_"],
            ["_","_","_","_","_","_","_","_","_","_"],
            ["_","_","_","_","_","_","_","_","_","_"],
            ["_","_","_","_","_","_","_","_","_","_"],
            ["_","_","_","_","_","_","_","_","_","_"],
            ["_","_","_","_","_","_","_","_","_","_"],
            ["_","_","_","z","_","_","_","j","j","j"],
            ["o","o","z","z","_","_","_","_","s","j"],
            ["o","o","z","i","i","i","i","_","s","s"],
            ["i","o","o","l","l","l","_","_","s","s"],
            ["i","o","o","l","l","_","_","_","s","s"],
            ["i","j","l","l","l","t","_","z","z","s"],
            ["i","j","j","j","t","t","t","_","z","z"],
        ]);

        this.handler = createTBPHandler({ type: "test2", interval: 1 }, this.singleGame.gameContext, this.singleGame.gameHighContext, controlOrderGateway);
    }

    update(time, delta) {
        const delta_s = delta/1000;
        const {placed} =  this.singleGame.gameUpdator.update(delta_s);
        this.handler.update(placed);
        this.singleGame.gameViewController.update(delta_s);
        this.singleGame.renewReport();
    }
}

export const run = () => {

    const { box, log } = createLogBox();
    document.getElementById("log-container").appendChild(box);
    window.log = log;

    const config = {
        width: 1280,
        height: 720,
        scale: {
            mode: Phaser.Scale.NONE,
            autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        dom: {
            createContainer: true
        },
        backgroundColor: "#ddd",
        parent: "game-box",
        scene: [BootloaderScene, MenuScene, PlayScene],
    };
    const game = new Phaser.Game(config);
    const gameBox = document.getElementById("game-box");
    gameBox.setAttribute("tabindex", "0");
    gameBox.addEventListener("click", e => {
        gameBox.focus();
    });

    gameBox.addEventListener("focus", e => {
        game.inputEnabled = true;
    });
    gameBox.addEventListener("blur", e => {
        game.inputEnabled = false;
    });
    gameBox.focus();

    const outerGameBox = document.getElementById("outer-game-box");
    requestAnimationFrame(() => {
        if (game.canvas) {
            outerGameBox.style.width = `${game.canvas.clientWidth}px`;
        }
    });
}
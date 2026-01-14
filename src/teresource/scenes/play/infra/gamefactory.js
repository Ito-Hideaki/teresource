import { CurrentMinoManager, Bag, MinoQueueManager, HeldMinoManager } from "../core/minomanager";
import { BoardSize, CellBoard } from "../core/mechanics";
import { ControlOrderProvider, BoardUpdater, BoardUpdateState } from "../controller/boardcontroller";
import { GameContext, GameViewContext } from "./context";
import { GameViewController } from "../view/gameviewcontroller";
import { GameController } from "../controller/gamecontroller";
import { PlayScene } from "../../play";
import { RotationSystem_NoKick, RotationSystem_Standard } from "../core/rotationsystem";
import { createRelativePositionGetter } from "#util";

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

export class GameFactory {

    /** @param {PlayScene} scene @param {GameConfig} gameConfig */
    static create(scene, gameConfig) {
        const boardSize = new BoardSize(40, 10);
        const currentMinoManager = new CurrentMinoManager();
        const cellBoard = new CellBoard(boardSize);
        const minoQueueManager = new MinoQueueManager(new Bag(Bag.TYPES.SEVEN, getBagConfig(gameConfig)));
        const heldMinoManager = new HeldMinoManager();
        const boardUpdateState = new BoardUpdateState();
        const gameContext = new GameContext({
            cellBoard, boardSize, currentMinoManager, minoQueueManager, heldMinoManager, boardUpdateState, rotationSystem: new RotationSystem_Standard()
        });
        const controlOrderProvider = new ControlOrderProvider(getControlOrderProviderConfig(gameConfig));
        const boardUpdater = new BoardUpdater(gameContext);
        const gameController = new GameController(gameContext, { boardUpdater, controlOrderProvider });
        //Create elements of the scene
        const boardCellWidth = 26;
        const skin = gameConfig.skin;
        const boardContainer = scene.add.container();
        const relativeBoardPositionGetter = createRelativePositionGetter(boardCellWidth, 20, boardSize.columnCount, -20, 0);
        const gameViewContext = new GameViewContext({
            cellSheetParent: scene.cellSheetParentIndex[skin],
            gameContext,
            boardContainer,
            getRelativeBoardX: relativeBoardPositionGetter.getRelativeX,
            getRelativeBoardY: relativeBoardPositionGetter.getRelativeY
        });
        const gameViewController = new GameViewController(scene, gameViewContext, { boardCellWidth });
        gameViewController.x = scene.game.canvas.width / 2;
        gameViewController.y = scene.game.canvas.height / 2;

        return {
            gameController,
            gameContext,
            gameViewController,
            controlOrderProvider
        }
    }
}
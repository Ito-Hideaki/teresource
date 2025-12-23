import { CurrentMinoManager, Bag, MinoQueueManager } from "./minomanager";
import { BoardSize, CellBoard } from "./mechanics";
import { ControlOrderProvider, BoardUpdater, BoardUpdateState } from "./boardcontroller";
import { GameContext, GameViewContext } from "./context";
import { ViewController } from "./viewcontroller";
import { GameController } from "./gamecontroller";
import { PlayScene } from "../play";
import { RotationSystem_NoKick, RotationSystem_Standard } from "./rotationsystem";

export class GameFactory {

    /** @param {PlayScene} scene */
    static create(scene) {
        const boardSize = new BoardSize(40, 10);
        const currentMinoManager = new CurrentMinoManager();
        const cellBoard = new CellBoard(boardSize);
        console.log(cellBoard);
        const minoQueueManager = new MinoQueueManager(new Bag(Bag.TYPES.SEVEN));
        const boardUpdateState = new BoardUpdateState();
        const gameContext = new GameContext({
            cellBoard, boardSize, currentMinoManager, minoQueueManager, boardUpdateState, rotationSystem: new RotationSystem_Standard()
        });
        const controlOrderProvider = new ControlOrderProvider();
        const boardUpdater = new BoardUpdater(gameContext);
        const gameController = new GameController(gameContext, { boardUpdater, controlOrderProvider });
        //Create elements of the scene
        console.log(gameContext);

        const skin = "nine";
        const boardContainer = scene.add.container();
        const gameViewContext = new GameViewContext({
            cellSheetParent: scene.cellSheetParentIndex[skin],
            gameContext,
            boardContainer
        });
        const viewController = new ViewController(scene, gameViewContext);
        viewController.x = scene.game.canvas.width / 2;
        viewController.y = scene.game.canvas.height / 2;

        return {
            gameController,
            gameContext,
            viewController,
            controlOrderProvider
        }
    }
}
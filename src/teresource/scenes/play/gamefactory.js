import { CurrentMinoManager, Bag, MinoQueueManager } from "./minomanager";
import { BoardSize, CellBoard } from "./mechanics";
import { ControlOrderProvider, BoardController, BoardControlState } from "./boardcontroller";
import { GameContext, GameViewContext } from "./context";
import { ViewController } from "./viewcontroller";
import { GameController } from "./gamecontroller";
import { PlayScene } from "../play";

export class GameFactory {

    /** @param {PlayScene} scene */
    static create(scene) {
        const boardSize = new BoardSize(40, 10);
        const currentMinoManager = new CurrentMinoManager();
        const cellBoard = new CellBoard(boardSize);
        console.log(cellBoard);
        const minoQueueManager = new MinoQueueManager(new Bag(Bag.TYPES.SEVEN));
        const boardControlState = new BoardControlState();
        const gameContext = new GameContext({
            cellBoard, boardSize, currentMinoManager, minoQueueManager, boardControlState
        });
        const controlOrderProvider = new ControlOrderProvider();
        const boardController = new BoardController(gameContext);
        const gameController = new GameController(gameContext, { boardController, controlOrderProvider });
        //Create elements of the scene
        console.log(gameContext);

        const skin = "nine";
        const gameViewContext = new GameViewContext({ cellSheetParent: scene.cellSheetParentIndex[skin], gameContext });
        const viewController = new ViewController(scene, gameViewContext);
        viewController.x = scene.width / 2;
        viewController.y = scene.height / 2;

        return {
            gameController,
            gameContext,
            viewController,
            controlOrderProvider
        }
    }
}
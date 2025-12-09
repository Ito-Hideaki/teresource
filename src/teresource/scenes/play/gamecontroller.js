import Phaser from "phaser";
import { ControlOrder, BoardControlState, BoardController, createBoardControlResult, ControlOrderProvider } from "./boardcontroller";
import { CurrentMinoManager, MinoQueueManager, Bag } from "./minomanager";
import { Board, BoardSize } from "./mechanics";
import { ViewController } from "./viewcontroller";

/** Represents the game attached to each player */
export class GameController {

    #boardController
    #viewController
    #scene
    #controlOrder
    #controlOrderProvider
    /** @type {import("./boardcontroller").BoardControlResult} */
    #lastBoardControlResult

    /**
     * @param {Phaser.Scene} scene
     * @param {{
     * }} $
     */
    constructor(scene, $ = {}) {
        this.#scene = scene;

        const boardSize = new BoardSize();
        const currentMinoManager = new CurrentMinoManager();
        const board = new Board(undefined, boardSize);
        const boardControlState = new BoardControlState();
        this.#controlOrder = new ControlOrder();
        this.#controlOrderProvider = new ControlOrderProvider();
        this.#boardController = new BoardController(currentMinoManager, board, boardControlState, new MinoQueueManager(new Bag(Bag.TYPES.SEVEN)));
        //Create elements of the scene
        this.#viewController = new ViewController(this.#scene, {
            boardSize, board, currentMinoManager
        });
        this.#viewController.x = this.#scene.width / 2;
        this.#viewController.y = this.#scene.height / 2;

        this.#scene.input.keyboard.on("keydown", e => {
            if (e.repeat) {
                e.preventDefault(); return;
            }
            //list of controlOrders assigned to a perticulay key
            const controlOrderList = {
                "ArrowLeft" : ControlOrder.START_MOVE_LEFT,
                "ArrowRight": ControlOrder.START_MOVE_RIGHT,
                "ArrowDown" : ControlOrder.START_SOFT_DROP,
                "KeyX"      : ControlOrder.ROTATE_CLOCK_WISE,
                "KeyZ"      : ControlOrder.ROTATE_COUNTER_CLOCK,
                "Space"     : ControlOrder.HARD_DROP,
            }
            if (Object.keys(controlOrderList).includes(e.code)) {
                e.preventDefault();
                this.#controlOrderProvider.setNewPlayerInput(controlOrderList[e.code]);
            }
        });

        this.#scene.input.keyboard.on("keyup", e => {
            //list of controlOrders assigned to a perticulay key
            const controlOrderList = {
                "ArrowLeft" : ControlOrder.STOP_MOVE_LEFT,
                "ArrowRight": ControlOrder.STOP_MOVE_RIGHT,
                "ArrowDown" : ControlOrder.STOP_SOFT_DROP,
            }
            if (Object.keys(controlOrderList).includes(e.code)) {
                e.preventDefault();
                this.#controlOrderProvider.setNewPlayerInput(controlOrderList[e.code]);
            }
        })

        this.#lastBoardControlResult = new createBoardControlResult();
    }

    /** @param {number} deltaTime */
    update(deltaTime) {
        const controlOrder = this.#controlOrderProvider.provideControlOrder();
        this.#lastBoardControlResult = this.#boardController.update(controlOrder.value, deltaTime);
        this.#controlOrderProvider.receiveControlResult(this.#lastBoardControlResult);
        this.#controlOrderProvider.advanceTime(deltaTime);

        this.#viewController.update(deltaTime);
    }
}
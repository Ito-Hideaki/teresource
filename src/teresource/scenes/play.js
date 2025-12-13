import Phaser from "phaser";
import { GameController } from "./play/gamecontroller";
import { ViewController } from "./play/viewcontroller";
import {  calcAllImgCellViewParams, generateCellTextureKey, generateCellTextureUrl } from "./play/viewmechanics";
import { GameFactory } from "./play/gamefactory";
import { ControlOrder, ControlOrderProvider } from "./play/boardcontroller";




/**
 * @extends Phaser.Scene
 */
export class PlayScene extends Phaser.Scene {

    width;
    height;
    /** @type {GameController} */
    #gameController;
    /** @type {ViewController} */
    #viewController;
    /** @type {ControlOrderProvider} */
    #controlOrderProvider;

    constructor() {
        super({
            key: "play"
        });
    }

    preload() {
        const allCellViewParams =  calcAllImgCellViewParams();
        allCellViewParams.forEach(cellViewParams => {
            const key = generateCellTextureKey(cellViewParams);
            const url = generateCellTextureUrl(cellViewParams);
            console.log(url);
            this.load.image(key, url);
        });
    }

    create() {
        /** @type number */
        this.width = this.game.canvas.width;
        /** @type number */
        this.height = this.game.canvas.height;

        const gameElements = GameFactory.create(this);
        this.#gameController = gameElements.gameController;
        this.#viewController = gameElements.viewController;
        this.#controlOrderProvider = gameElements.controlOrderProvider;

        this.input.keyboard.on("keydown", e => {
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

        this.input.keyboard.on("keyup", e => {
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
    }

    update(time, delta) {
        const deltaTime = delta / 1000;
        this.#gameController.update(deltaTime);
        this.#viewController.update(deltaTime);
    }
}
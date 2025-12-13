import Phaser from "phaser";
import { GameController } from "./play/gamecontroller";
import { ViewController } from "./play/viewcontroller";
import {  calcAllImgCellViewParams, generateCellTextureKey, generateCellTextureUrl } from "./play/viewmechanics";
import { GameFactory } from "./play/gamefactory";




/**
 * @extends Phaser.Scene
 */
export class PlayScene extends Phaser.Scene {

    width;
    height;
    /** @type GameController */
    #gameController;
    /** @type ViewController */
    #viewController;

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
    }

    update(time, delta) {
        const deltaTime = delta / 1000;
        this.#gameController.update(deltaTime);
        this.#viewController.update(deltaTime);
    }
}
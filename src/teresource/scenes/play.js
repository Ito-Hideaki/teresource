import Phaser from "phaser";
import { GameController } from "./play/gamecontroller";
import {  calcAllImgCellViewParams, generateCellTextureKey, generateCellTextureUrl } from "./play/viewmechanics";




/**
 * @extends Phaser.Scene
 */
export class PlayScene extends Phaser.Scene {

    width;
    height;
    /** @type GameController */
    #gameController;

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

        this.#gameController = new GameController(this);
    }

    update(time, delta) {
        const deltaTime = delta / 1000;
        this.#gameController.update(deltaTime);
    }
}
import { GameReportStack } from "../controller/report";
import Phaser from "phaser";

export class GameAudioPlayer {
    #reportStack;
    #scene;
    /** @param {GameReportStack} reportStack @param {Phaser.Scene} scene */
    constructor(scene, reportStack) {
        this.#scene = scene;
        this.#reportStack = reportStack;
    }

    update() {
        const stack = this.#reportStack;
        const scene = this.#scene;
        if (stack.hardDrop.length) {
            scene.sound.play("mino_hard_drop");
        }
    }
}
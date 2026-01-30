import Phaser from "phaser";
import { GameViewContext } from "../infra/context";

export class GameStatsView {

    #gameReportStack;
    #gameStats;
    #scene;

    clearedLineText;

    /** @param {Phaser.Scene} scene @param {GameViewContext} gvContext */
    constructor(scene, gvContext) {
        this.#scene = scene;
        this.#gameReportStack = gvContext.gameContext.gameReportStack;
        this.#gameStats = gvContext.gameHighContext.gameStats;

        this.clearedLineText = scene.add.text(300, 500, "まだ消していない");
        this.clearedLineText.setFontSize(20);
        this.clearedLineText.setColor("black");
        this.clearedLineText.setFontFamily("monospace");
    }

    update() {
        if (this.#gameReportStack.lineClear[0]) {
            const report = this.#gameReportStack.lineClear[0];
            this.clearedLineText.setText(`${this.#gameStats.clearedLines}ライン消した`);
            this.#scene.add.tween({
                targets: this.clearedLineText,
                duration: 50,
                y: "-=10",
                ease: "Power2",
                yoyo: true
            });
        }
    }
}
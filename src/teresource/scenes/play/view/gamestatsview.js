import Phaser from "phaser";
import { GameViewContext } from "../infra/context";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
dayjs.extend(duration);

export class GameStatsView {

    #gameReportStack;
    #gameStats;
    #scene;

    /** @param {Phaser.Scene} scene @param {GameViewContext} gvContext */
    constructor(scene, gvContext) {
        this.#scene = scene;
        this.#gameReportStack = gvContext.gameContext.gameReportStack;
        this.#gameStats = gvContext.gameHighContext.gameStats;

        const styleConfig = {fontSize: 20, color: "black", fontFamily: "monospace"};

        this.clearedLineText = scene.add.text(300, 500, "まだ消していない", styleConfig);

        this.scoreText = scene.add.text(300, 530, "スコア　00000", styleConfig);

        this.timeText = scene.add.text(200, 560, "経過　", styleConfig);
    }

    update() {
        if (this.#gameReportStack.lineClear[0]) {
            this.clearedLineText.setText(`${this.#gameStats.clearedLines}ライン消した`);
            this.scoreText.setText(`スコア　${this.#gameStats.score.toString().padStart(5, "0")}`);
            this.#scene.add.tween({
                targets: [this.clearedLineText, this.scoreText],
                duration: 50,
                y: "-=10",
                ease: "Power2",
                yoyo: true
            });
        }
        const durationText = dayjs.duration(Math.floor(1000 * this.#gameStats.timePassed)).format("HH:mm:ss\"SSS");
        this.timeText.setText(`経過　${durationText.slice(0, durationText.length - 1)}`);
    }
}
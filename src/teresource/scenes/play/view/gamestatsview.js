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
        const container = gvContext.boardContainer;

        const TEXT_X = -320;

        this.clearedLineText = scene.add.text(TEXT_X, 100, "まだ消していない", styleConfig);
        container.add(this.clearedLineText);

        this.levelText = scene.add.text(TEXT_X, 130, "レベル　1", styleConfig);
        container.add(this.levelText);

        this.scoreText = scene.add.text(TEXT_X, 160, "スコア　00000", styleConfig);
        container.add(this.scoreText);

        this.timeText = scene.add.text(TEXT_X - 50, 190, "経過　", styleConfig);
        container.add(this.timeText);
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
        this.levelText.setText(`レベル　${this.#gameStats.level}`);
        const durationText = dayjs.duration(Math.floor(1000 * this.#gameStats.timePassed)).format("HH:mm:ss\"SSS");
        this.timeText.setText(`経過　${durationText.slice(0, durationText.length - 1)}`);
    }
}
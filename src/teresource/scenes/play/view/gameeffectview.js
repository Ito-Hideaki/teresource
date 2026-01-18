import { LineClearReport } from "../controller/report";
import { GameViewContext } from "../infra/context";
import Phaser from "phaser";

const LINE_CLEAR_EFFECT_DURATION_MAP = {
    "ichi": 0.24,
    "ni": 0.32,
    "san": 0.40,
    "yon": 0.48
}

class LineClearEffectGraphics extends Phaser.GameObjects.Graphics {
    #rowToClearList;
    #effectDuration;
    #timePassed = 0;
    #getRelativeX;
    #getRelativeY;
    #cellWidth;
    #boardSize;

    /** @param {Phaser.Scene} scene @param {GameViewContext} gvContext @param {LineClearReport} report */
    constructor(scene, gvContext, report) {
        super(scene);
        this.#rowToClearList = report.getData().rowToClearList;
        this.#effectDuration = LINE_CLEAR_EFFECT_DURATION_MAP[report.getData().code];
        this.#getRelativeX = gvContext.getRelativeBoardX;
        this.#getRelativeY = gvContext.getRelativeBoardY;
        this.#cellWidth = gvContext.getBoardCellWidth();
        this.#boardSize = gvContext.gameContext.boardSize;
    }

    update(delta_s) {
        this.#timePassed += delta_s;
        console.log(this.#timePassed);
        if (this.#timePassed >= this.#effectDuration) {
            this.destroy();
        } else {
            this.#updateGraphics();
        }
    }

    #drawCell(row, column, timePassed) {
        this.fillStyle(0xffffff);
        if (timePassed < 0.24) {
            this.fillRect(this.#getRelativeX(column), this.#getRelativeY(row), this.#cellWidth, this.#cellWidth);
        }
    }

    /** @param {number} timePassed */
    #drawRow(row, timePassed) {
        for (let column = 0; column < this.#boardSize.columnCount; column++) {
            this.#drawCell(row, column, timePassed);
        }
    }

    #updateGraphics() {
        this.clear();
        this.#rowToClearList.forEach((row, num) => {
            const delay = 0.05 * num;
            this.#drawRow(row, this.#timePassed - delay);
        });
    }
}

export class GameEffectManagerView {

    #gvContext;
    #boardContainer;
    #gameReportStack;
    #updateEffectList = [];
    #scene;

    /** @param {Phaser.Scene} scene @param {GameViewContext} gvContext */
    constructor(scene, gvContext) {
        this.#scene = scene;
        this.#boardContainer = gvContext.boardContainer;
        this.#gvContext = gvContext;
        this.#gameReportStack = gvContext.gameContext.gameReportStack;
    }

    update(delta_s) {
        this.#gameReportStack.LineClear.forEach(report => {
            this.createLineClearEffect(report);
        });
        this.#updateEffectList.forEach(obj => {
            obj.update(delta_s);
        })
    }

    /** @param {LineClearReport} report */
    createLineClearEffect(report) {
        const effect = new LineClearEffectGraphics(this.#scene, this.#gvContext, report);
        this.#updateEffectList.push(effect);
        effect.on("destroy", () => { //remove from update list
            this.#updateEffectList.splice(this.#updateEffectList.indexOf(effect), 1);
        });
        this.#scene.add.existing(effect);
        this.#boardContainer.add(effect);
    }
}
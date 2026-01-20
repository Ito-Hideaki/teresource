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
        const startVanish = 0.06, completeVanish = 0.24;
        const rectX = this.#getRelativeX(column), rectY =  this.#getRelativeY(row), rectWidth = this.#cellWidth;

        this.fillStyle(0xffffff);
        if(timePassed < startVanish) {
            this.fillRect(rectX, rectY, rectWidth, rectWidth);
        }
        else if (timePassed < completeVanish) {
            const vanishProgress = (timePassed - startVanish) / (completeVanish - startVanish);

            if (vanishProgress <= 0.5) {
                //fill polygon (rect without top-left triangle)
                const triWidth = rectWidth * (vanishProgress * 2);
                const polygon = new Phaser.Geom.Polygon([
                    rectX + triWidth,  rectY,               //top 135deg corner
                    rectX,             rectY + triWidth,    //left 135deg corner
                    rectX,             rectY + rectWidth,   //bottom left 90deg corner
                    rectX + rectWidth, rectY + rectWidth,   //bottom right 90deg corner
                    rectX + rectWidth, rectY,               //top right 90deg corner
                ]);
                this.fillPoints(polygon.points, true);
            } else { // 0.5 < vanishProgress < 1
                //fill bottom-right triangle
                const triWidth = rectWidth * (2 - vanishProgress * 2);
                this.fillTriangle(
                    rectX + rectWidth - triWidth, rectY + rectWidth,              //left 45deg corner
                    rectX + rectWidth,            rectY + rectWidth - triWidth,   //top 45deg corner
                    rectX + rectWidth,            rectY + rectWidth               //bottom right 90deg corner
                );
            }
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
            this.#drawRow(row, this.#timePassed);
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
        this.#gameReportStack.lineClear.forEach(report => {
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
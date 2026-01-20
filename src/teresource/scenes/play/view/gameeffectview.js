import { LineClearReport } from "../controller/report";
import { GameViewContext } from "../infra/context";
import Phaser from "phaser";

class LineClearEffectGraphics extends Phaser.GameObjects.Graphics {
    #rowToClearList;
    #timePassed = 0;
    #effectDuration = 0.24;
    #getRelativeX;
    #getRelativeY;
    #cellWidth;
    #boardSize;

    /** @param {Phaser.Scene} scene @param {GameViewContext} gvContext @param {LineClearReport} report */
    constructor(scene, gvContext, report) {
        super(scene);
        this.#rowToClearList = report.getData().rowToClearList;
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

    #drawCell(row, column, vanishProgress) {
        const rectX = this.#getRelativeX(column), rectY = this.#getRelativeY(row), rectWidth = this.#cellWidth;

        this.fillStyle(0xffffff);
        if (vanishProgress <= 0.5) {
            //fill polygon (rect without top-left triangle)
            const triWidth = rectWidth * (vanishProgress * 2);
            const polygon = new Phaser.Geom.Polygon([
                rectX + triWidth, rectY,               //top 135deg corner
                rectX, rectY + triWidth,    //left 135deg corner
                rectX, rectY + rectWidth,   //bottom left 90deg corner
                rectX + rectWidth, rectY + rectWidth,   //bottom right 90deg corner
                rectX + rectWidth, rectY,               //top right 90deg corner
            ]);
            this.fillPoints(polygon.points, true);
        } else { // 0.5 < vanishProgress < 1
            //fill bottom-right triangle
            const triWidth = rectWidth * (2 - vanishProgress * 2);
            this.fillTriangle(
                rectX + rectWidth - triWidth, rectY + rectWidth,              //left 45deg corner
                rectX + rectWidth, rectY + rectWidth - triWidth,   //top 45deg corner
                rectX + rectWidth, rectY + rectWidth               //bottom right 90deg corner
            );
        }
    }

    /** @param {number} vanishProgress */
    #drawRow(row, vanishProgress) {
        for (let column = 0; column < this.#boardSize.columnCount; column++) {
            this.#drawCell(row, column, vanishProgress);
        }
    }

    #updateGraphics() {
        const startVanish = 0.03, completeVanish = 0.24;
        const vanishProgress = this.#timePassed < startVanish ? 0 : (this.#timePassed - startVanish) / (completeVanish - startVanish);

        this.clear();
        this.#rowToClearList.forEach((row, num) => {
            this.#drawRow(row, vanishProgress);
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
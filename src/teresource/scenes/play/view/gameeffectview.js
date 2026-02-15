import { LineClearReport } from "../controller/report";
import { GameViewContext } from "../infra/context";
import Phaser from "phaser";
import { createCellViewParamsFromCell, generateCellSheetTextureFrameKey } from "./celltexturecore";
import { CellImage } from "./cellimage";

class LineClearWipeEffectGraphics extends Phaser.GameObjects.Graphics {
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
        this.#rowToClearList = report.data.clearedRowList;
        this.#getRelativeX = gvContext.getRelativeBoardX;
        this.#getRelativeY = gvContext.getRelativeBoardY;
        this.#cellWidth = gvContext.getBoardCellWidth();
        this.#boardSize = gvContext.gameContext.boardSize;

        scene.events.on("update", this.update, this);
    }

    update(time, delta) {
        const delta_s = delta / 1000;
        this.#timePassed += delta_s;
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
        const pVanishProgress = Math.pow(vanishProgress, 1.7);

        this.clear();
        if (vanishProgress < 1) {
            this.#rowToClearList.forEach((row, num) => {
                this.#drawRow(row, pVanishProgress);
            });
        }
    }

    destroy() {
        this.scene.events.off("update", this.update);
        super.destroy();
    }
}

/** @param {Phaser.Scene} scene @param {GameViewContext} gvContext @param {LineClearReport} report */
function createFlashEffects(scene, gvContext, report) {
    const gameobjects = [];
    const cellWidth = gvContext.getBoardCellWidth();
    for (let i = 0; i < report.data.clearedRowList.length; i++) {
        const ri = report.data.clearedRowList[i];
        const topLeftY = gvContext.getRelativeBoardY(ri);
        const row = report.rowList[i];
        for (let ci = 0; ci < row.length; ci++) {
            const topLeftX = gvContext.getRelativeBoardX(ci);
            const cell = row[ci];
            const graphics = new Phaser.GameObjects.Graphics(scene);
            graphics.x = topLeftX + cellWidth / 2;
            graphics.y = topLeftY + cellWidth / 2;
            graphics.blendMode = Phaser.BlendModes.ADD;
            graphics.alpha = 1;
            graphics.scale = 0.5;
            graphics.fillStyle(0xffffff);
            graphics.fillRect(cellWidth * -0.5, cellWidth * -0.5, cellWidth, cellWidth);
            scene.tweens.add({
                duration: 150 + report.rowList.length * 50,
                targets: graphics,
                props: {
                    scale: { value: "1.5", ease: "Cubic" },
                    alpha: { value: "0", ease: "Cubic.easeIn" }
                },
                onComplete: () => { graphics.destroy() }
            });
            gameobjects.push(graphics);
        }
    }
    return gameobjects;
}

/** @param {Phaser.Scene} scene @param {GameViewContext} gvContext @param {LineClearReport} report */
function createChocoShatteringEffects(scene, gvContext, report) {
    const gameobjects = [];
    const cellWidth = gvContext.getBoardCellWidth();

    //for each row
    for (let i = 0; i < report.data.clearedRowList.length; i++) {
        const ri = report.data.clearedRowList[i];
        const topLeftY = gvContext.getRelativeBoardY(ri);
        const row = report.rowList[i];
        //for each column
        for (let ci = 0; ci < row.length; ci++) {
            const topLeftX = gvContext.getRelativeBoardX(ci);
            const cell = row[ci];
            //create gameobject
            const img = new CellImage(scene, topLeftX + cellWidth / 2, topLeftY + cellWidth / 2, gvContext.cellSheetParent, cellWidth);
            img.setView(createCellViewParamsFromCell(cell));
            img.alpha = 0.7;
            const initialDirection = Math.random() * Math.PI * 2;
            const initialSpeed = Math.random() * 300;
            let vx = Math.cos(initialDirection) * initialSpeed;
            let vy = Math.sin(initialDirection) * initialSpeed;
            const vrotation = (Math.random() - 0.5) * 3;
            function update(time, delta) {
                const delta_s = delta / 1000;
                vy += 500 * delta_s;
                img.x += vx * delta_s;
                img.y += vy * delta_s;
                img.rotation += vrotation * delta_s;
                img.alpha -= 0.3 * delta_s;
                if (img.alpha <= 0) {
                    scene.events.off("update", update);
                    img.destroy();
                }
            }
            scene.events.on("update", update);
            //push gameobject
            gameobjects.push(img);
        }
    }
    return gameobjects;
}

/** @param {Phaser.GameObjects.GameObject} thisObj @return {Phaser.Types.Tweens.TweenChainBuilderConfig}*/
function get_POPUP_TWEEN_CHAIN_CONFIG(thisObj) {
    return {
        tweens: [
            {
                targets: thisObj,
                alpha: 1,
                duration: 800,
            },
            {
                targets: thisObj,
                alpha: { start: 1, to: 0 },
                duration: 200,
                onComplete: () => {
                    thisObj.destroy();
                }
            },
        ]
    };
}

/** @type {Phaser.GameObjects.TextStyle} */
const POPUP_STYLE_CONFIG = {
    fontStyle: "bold",
    fontFamily: "serif"
};

class LineClearPopupText extends Phaser.GameObjects.Text {
    /** @param {Phaser.Scene} scene @param {GameViewContext} gvContext @param {LineClearReport} report */
    constructor(scene, gvContext, report) {
        let sentence;
        if (report.data.clearedRowList.length === 1 && report.data.isSpecial && report.data.isMini) {
            sentence = "みに";
        } else {
            sentence = ["", "しんぐる", "だぶる", "とりぷる", "くあどらぷる"][report.data.clearedRowList.length];
        }
        super(scene, gvContext.getRelativeBoardX(0) - 20, 10, sentence, {
            ...POPUP_STYLE_CONFIG, fontSize: 40, color: "black"
        });
        this.setOrigin(1, 0.5);

        this.scene.tweens.chain(get_POPUP_TWEEN_CHAIN_CONFIG(this)).play();
    }
}

class LineClearPopupSpecialText extends Phaser.GameObjects.Text {
    /** @param {Phaser.Scene} scene @param {GameViewContext} gvContext @param {LineClearReport} report */
    constructor(scene, gvContext, report) {
        const sentence = "すぺしゃる";
        super(scene, gvContext.getRelativeBoardX(0) - 20, -25, sentence, {
            ...POPUP_STYLE_CONFIG, fontSize: 30, color: "#a0a"
        });
        this.setOrigin(1, 0.5);

        this.scene.tweens.chain(get_POPUP_TWEEN_CHAIN_CONFIG(this)).play();
    }
}

class LineClearPopupComboText extends Phaser.GameObjects.Text {
    /** @param {Phaser.Scene} scene @param {GameViewContext} gvContext @param {LineClearReport} report */
    constructor(scene, gvContext, report) {
        const sentence = `${report.data.combo}れん`;
        super(scene, gvContext.getRelativeBoardX(0) - 20, 45, sentence, {
            ...POPUP_STYLE_CONFIG, fontSize: 30, color: "#0a0"
        });
        this.setOrigin(1, 0.5);

        this.scene.tweens.chain(get_POPUP_TWEEN_CHAIN_CONFIG(this)).play();
    }
}

class LineClearPopupB2BText extends Phaser.GameObjects.Text {
    /** @param {Phaser.Scene} scene @param {GameViewContext} gvContext @param {LineClearReport} report */
    constructor(scene, gvContext, report) {
        const sentence = `ばっくとぅーばっく`;
        super(scene, gvContext.getRelativeBoardX(0) - 20, 75, sentence, {
            ...POPUP_STYLE_CONFIG, fontSize: 30, color: "#40b"
        });
        this.setOrigin(1, 0.5);

        this.scene.tweens.chain(get_POPUP_TWEEN_CHAIN_CONFIG(this)).play();
    }
}

class LineClearPopupView {
    #gvContext;
    #boardContainer;
    #scene;

    /** @param {Phaser.Scene} scene @param {GameViewContext} gvContext */
    constructor(scene, gvContext) {
        this.#gvContext = gvContext;
        this.#boardContainer = gvContext.boardContainer;
        this.#scene = scene;
    }

    /** @param {LineClearReport} report */
    create(report) {
        const text = new LineClearPopupText(this.#scene, this.#gvContext, report);
        this.#scene.add.existing(text);
        this.#boardContainer.add(text);

        if (report.data.isSpecial) {
            const special = new LineClearPopupSpecialText(this.#scene, this.#gvContext, report);
            this.#scene.add.existing(special);
            this.#boardContainer.add(special);
        }

        if (report.data.combo) {
            const combo = new LineClearPopupComboText(this.#scene, this.#gvContext, report);
            this.#scene.add.existing(combo);
            this.#boardContainer.add(combo);
        }

        if (report.data.B2B) {
            const b2b = new LineClearPopupB2BText(this.#scene, this.#gvContext, report);
            this.#scene.add.existing(b2b);
            this.#boardContainer.add(b2b);
        }
    }
}

class AllClearText extends Phaser.GameObjects.Text {
    /** @param {Phaser.Scene} scene */
    constructor(scene) {
        super(scene, 0, 0, "ぜんけし");
        this.setFontSize(60);
        this.setFontFamily("sans-serif");
        this.setFontStyle("bold");
        this.setColor("yellow");
        this.setOrigin(0.5, 0.5);
        scene.tweens.chain({
            tweens: [
                {
                    targets: this,
                    scale: { from: 1.2, to: 1 },
                    duration: 50,
                },
                {
                    delay: 800,
                    targets: this,
                    scale: 0.001,
                    alpha: 0,
                    duration: 100,
                    onComplete: this.destroy,
                },
            ]
        });
    }
}

export class GameEffectManagerView {

    #gvContext;
    #boardContainer;
    #gameReportStack;
    #scene;
    #lineClearPopupView;

    /** @param {Phaser.Scene} scene @param {GameViewContext} gvContext */
    constructor(scene, gvContext) {
        this.#scene = scene;
        this.#boardContainer = gvContext.boardContainer;
        this.#gvContext = gvContext;
        this.#gameReportStack = gvContext.gameContext.gameReportStack;

        this.#lineClearPopupView = new LineClearPopupView(scene, gvContext);
    }

    update(delta_s) {
        this.#gameReportStack.lineClear.forEach(report => {
            this.createLineClearEffect(report);
            this.#lineClearPopupView.create(report);
            if (report.data.isAllClear) {
                const allClearText = new AllClearText(this.#scene);
                this.#scene.add.existing(allClearText);
                this.#boardContainer.add(allClearText);
            }
        });
    }

    /** @param {LineClearReport} report */
    createLineClearEffect(report) {
        const gameobjects = createChocoShatteringEffects(this.#scene, this.#gvContext, report);
        for (const gameobject of gameobjects) {
            this.#scene.add.existing(gameobject);
            this.#boardContainer.add(gameobject);
        }

        const effect = new LineClearWipeEffectGraphics(this.#scene, this.#gvContext, report);
        this.#scene.add.existing(effect);
        this.#boardContainer.add(effect);
    }
}
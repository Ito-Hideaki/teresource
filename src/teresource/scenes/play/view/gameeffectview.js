import { GameViewContext } from "../infra/context";
import Phaser from "phaser";

class LineClearEffectGraphics extends Phaser.GameObjects.Graphics {
    /** @param {GameViewContext} gvContext @param {number[]} rowToClearList */
    constructor(scene, gvContext, rowToClearList) {
        super(scene);
        console.log("くぁｗせｄｒｆｔｇｙふじこｌｐ");
        this.destroy();
    }
}

export class GameEffectManagerView {

    #gvContext;
    #boardContainer;
    #scene;

    /** @param {Phaser.Scene} scene @param {GameViewContext} gvContext */
    constructor(scene, gvContext) {
        this.#scene = scene;
        this.#boardContainer = gvContext.boardContainer;
        this.#gvContext = gvContext;
        this.createLineClearEffect([30]);
    }

    /** @param {number[]} rowToClearList */
    createLineClearEffect(rowToClearList) {
        const effect = new LineClearEffectGraphics(this.#scene, this.#gvContext, rowToClearList)
        this.#scene.add.existing(effect);
        this.#boardContainer.add(effect);
    }
}
import Phaser from "phaser";
import { GameViewContext } from "../infra/context";

export class MinoQueueView {
    /** @param {Phaser.Scene} scene @param {GameViewContext} context */
    constructor(scene, context) {
        this.minoQueue = context.gameContext.minoQueueManager.minoQueue;
    }

    update() {
        if (import.meta.env.DEV) {
            const elm = document.getElementById("minoqueue");
            if (!elm) return;
            const minoCharStr = "ZLOSIJT";
            const nextQueueMino = this.minoQueue.slice(0, 5);
            const text = nextQueueMino.map(mino => minoCharStr[mino.type]).toString();
            document.getElementById("minoqueue").textContent = text;
        }
    }
}
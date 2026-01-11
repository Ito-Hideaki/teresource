import Phaser from "phaser";
import { viteURLify } from "#util";

export class BootloaderScene extends Phaser.Scene {
    constructor() {
        super({
            key: "bootloader",
            background: 0x000,
        });
    }
    preload() {
        this.load.image("loading_bar", viteURLify("/image/loading_bar.png"));
    }

    create() {
        const scene = this;
        const bar = this.add.image(scene.game.canvas.width / 2, scene.game.canvas.height / 2, "loading_bar");
        bar.setDisplaySize(scene.game.canvas.width / 2, scene.game.canvas.width / 20);
        bar.setCrop(0, 0, 0, 0);

        this.load.on("progress", progress => {
            bar.setCrop(0, 0, bar.texture.width * progress, bar.texture.height);
        });
    }
}
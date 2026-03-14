import Phaser from "phaser";
import { viteURLify } from "#util";
import { createSecondLevelTextures, loadFirstLevelTextures as loadFirstLevelTexturesOfPlayScene } from "./play";
import { generateCellSheetTextureKey } from "./play/view/celltexturecore";

export class BootloaderScene extends Phaser.Scene {
    constructor() {
        super({
            key: "bootloader",
            backgroundColor: "#000",
        });
    }
    preload() {
        this.load.image("loading_bar", viteURLify("/image/loading_bar.png"));
    }

    create() {
        const scene = this;

        const background = this.add.graphics();
        background.fillStyle(0x000000);
        background.fillRect(0, 0, scene.game.canvas.width, scene.game.canvas.height);

        const bar = this.add.image(scene.game.canvas.width / 2, scene.game.canvas.height / 2, "loading_bar");
        bar.setDisplaySize(scene.game.canvas.width / 2, scene.game.canvas.width / 20);

        function setProgress(progress) {
            bar.setCrop(0, 0, bar.width * progress, bar.height);
        }

        new Promise((resolve, reject) => {
            this.load.on("progress", setProgress);
            loadFirstLevelTexturesOfPlayScene(this);
            this.load.once("complete", () => { resolve() });
            this.load.start();
        }).then(() => {
            this.game.cellSheetParentIndex = createSecondLevelTextures(this);
            document.body.appendChild(this.textures.get(generateCellSheetTextureKey("nine")).getSourceImage());
            this.scene.start("play");
        });
    }

    update() {

    }
}
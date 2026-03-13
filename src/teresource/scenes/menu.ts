import Phaser from "phaser";

export class MenuScene extends Phaser.Scene {

    constructor() {
        super('menu');
    }

    create() {
        const title = this.add.text(100, 100, "Teresource", { color: "black", fontSize: 100, fontFamily: "sans-serif" });
    }

    update() {
    }
}
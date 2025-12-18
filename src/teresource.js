import Phaser from "phaser";
import { PlayScene } from "./teresource/scenes/play";

addEventListener("DOMContentLoaded", () => {
    const config = {
        width: 1280,
        height: 720,
        scale: {
            mode: Phaser.Scale.NONE,
            autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        backgroundColor: "#ddd",
        parent: "game-container",
        scene: PlayScene,
    };

    new Phaser.Game(config);
});
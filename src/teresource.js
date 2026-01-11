import Phaser from "phaser";
import { PlayScene } from "./teresource/scenes/play";
import { BootloaderScene } from "./teresource/scenes/bootloader";
import { createConfigUIBoard } from "./teresource/configUI";

addEventListener("DOMContentLoaded", () => {

    const { element, configUIDataHandlerMap } = createConfigUIBoard();
    document.getElementById("config-container").appendChild(element);

    const config = {
        width: 1280,
        height: 720,
        scale: {
            mode: Phaser.Scale.NONE,
            autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        dom: {
            createContainer: true
        },
        backgroundColor: "#ddd",
        parent: "game-container",
        scene: [BootloaderScene, PlayScene],
    };

    const game = new Phaser.Game(config);
    game.configUIDataHandlerMap = configUIDataHandlerMap;
});
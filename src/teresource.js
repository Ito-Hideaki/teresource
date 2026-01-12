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
    const gameContainer = document.getElementById("game-container");
    gameContainer.setAttribute("tabindex", "0");

    gameContainer.addEventListener("click", e => {
        gameContainer.focus();
    });

    gameContainer.addEventListener("focus", e => {
        console.log("focus");
        game.inputEnabled = true;
    });
    gameContainer.addEventListener("blur", e => {
        console.log("blur");
        game.inputEnabled = false;
    });
});
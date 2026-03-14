import Phaser from "phaser";
import { PlayScene } from "./teresource/scenes/play";
import { BootloaderScene } from "./teresource/scenes/bootloader";
import { createConfigUIElement } from "./teresource/configUI";
import { createLogBox } from "./teresource/logUI";
import { MenuScene } from "./teresource/scenes/menu";

addEventListener("DOMContentLoaded", () => {

    const { box, log } = createLogBox();
    document.getElementById("log-container").appendChild(box);
    window.log = log;

    const { element, configUIDataHandlerMap } = createConfigUIElement([
        "game",
        "autoDamage",
        "personalization",
        "handling",
        "objective",
        "keyBinding"
    ]);
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
        scene: [BootloaderScene, MenuScene, PlayScene],
    };

    const game = new Phaser.Game(config);
    game.configUIDataHandlerMap = configUIDataHandlerMap;
    const gameContainer = document.getElementById("game-container");
    gameContainer.setAttribute("tabindex", "0");

    gameContainer.addEventListener("click", e => {
        gameContainer.focus();
    });

    gameContainer.addEventListener("focus", e => {
        game.inputEnabled = true;
    });
    gameContainer.addEventListener("blur", e => {
        game.inputEnabled = false;
    });

    gameContainer.focus();
});
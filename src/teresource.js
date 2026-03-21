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
        "objective"
    ]);
    //document.getElementById("config-container").appendChild(element);


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
        parent: "game-box",
        scene: [BootloaderScene, MenuScene, PlayScene],
    };
    const game = new Phaser.Game(config);
    game.configUIDataHandlerMap = configUIDataHandlerMap;
    const gameBox = document.getElementById("game-box");
    gameBox.setAttribute("tabindex", "0");
    gameBox.addEventListener("click", e => {
        gameBox.focus();
    });

    gameBox.addEventListener("focus", e => {
        game.inputEnabled = true;
    });
    gameBox.addEventListener("blur", e => {
        game.inputEnabled = false;
    });
    gameBox.focus();

    const outerGameBox = document.getElementById("outer-game-box");
    requestAnimationFrame(() => {
        if (game.canvas) {
            outerGameBox.style.width = `${game.canvas.clientWidth}px`;
        }
    });
});
import Phaser from "phaser";
import { createAndAddSettingsPanel } from "./menu/settingspanel";
import { GameConfig, TYPICAL_GAME_CONFIG } from "./play/controller/game";
import { KeyBindingConfig } from "./play/controller/controlorder";
import { MINO_DATA_INDEX } from "./play/core/coredata";
import { PlayerKeyboardControlConfig, PlaySceneData } from "./play";
import { GameSession, GameSessionConfig } from "./play/controller/gamesession";
import { CustomGameTab } from "./menu/customgame";
import { TEXT_LEFT } from "./menu/design";
import { ItemCommand, MenuObject } from "./menu/menuobject";

export function createMenuTexture(scene: Phaser.Scene) {
    { //cursor
        const h = 30, w = 30;
        const graphics = scene.add.graphics();
        const triShape = new Phaser.Geom.Triangle(
            0, 0,
            0, h,
            w, h / 2
        );
        //black color frame
        graphics.fillStyle(0x000000);
        graphics.fillTriangleShape(triShape);
        //red color frame
        graphics.translateCanvas(w, 0);
        graphics.fillStyle(0xff0000);
        graphics.fillTriangleShape(triShape);

        graphics.generateTexture("menu_cursor", w * 2, h);
        const texture = scene.textures.get("menu_cursor");
        texture.add("black", 0, 0, 0, w, h);
        texture.add("red", 0, w, 0, w, h);
    }
}

export class MenuScene extends Phaser.Scene {

    //@ts-ignore
    menuObj: MenuObject
    //@ts-ignore
    creditsDOM: Phaser.GameObjects.DOMElement
    //@ts-ignore
    customGameTab: CustomGameTab | null;

    constructor() {
        super('menu');
    }

    preload() {
    }

    create() {
        const scene = this;

        scene.add.text(TEXT_LEFT, 50, "Teresource", { color: "black", fontSize: 70, fontFamily: "sans-serif" });

        this.menuObj = new MenuObject(scene);

        this.customGameTab = null;

        const creditsElm = document.createElement('div');
        creditsElm.innerHTML = `
<p>使用しているライブラリ：Phaser3, day.js, vite</p>

<table style="border: none; width:100%;">
<tr><th style="width:50%;">画像</th><th>hide</th style="width:50%;"></tr>
<tr><th>プログラム</th><th>hide</th></tr>
<tr><th>効果音</th><th>ike</th></tr>
<tr><th><a href="https://github.com/MinusKelvin/cold-clear-2">Cold Clear 2</a></th><th><a href="https://github.com/MinusKelvin">MinusKelvin</a></th></tr>
</table>
`;
        creditsElm.style.fontSize = "30px";
        creditsElm.style.padding = "10px";
        creditsElm.style.width = `${1280 - 100 * 2}px`;
        creditsElm.style.backgroundColor = "#fff";
        this.creditsDOM = scene.add.dom(100, 200, creditsElm);
        this.creditsDOM.setOrigin(0, 0);

        this.creditsDOM.setVisible(false);

        const { setVisible: setSettingsVisible, configUIDataHandlerMap, destroyPanel: destroySettingsPanel } = createAndAddSettingsPanel();
        const keyBindingConfigUIDataHandler = configUIDataHandlerMap.keyBinding;
        setSettingsVisible(false);

        //@ts-ignore
        scene.input.keyboard.on("keydown", (e: KeyboardEvent) => {
            // @ts-ignore
            if (!this.game.inputEnabled) return;
            e.preventDefault();

            if (e.code === "KeyZ") scene.menuObj.userEnter();

            if (e.code === "KeyX") scene.menuObj.userEscape();

            if (e.code === "ArrowDown") scene.menuObj.userDown();

            if (e.code === "ArrowUp") scene.menuObj.userUp();
        });

        scene.menuObj.ee.on("itemcommand", (command: ItemCommand) => {
            const keyBindingConfig = keyBindingConfigUIDataHandler.getConfig();
            const playerKeyboardControlConfig = { type: "keyboard", ...keyBindingConfig } as PlayerKeyboardControlConfig;

            switch(command.type) {
                case "play":
                    scene.scene.start("play", command.createData(playerKeyboardControlConfig));
                    break;
                case "custom_play":
                    this.customGameTab?.play(keyBindingConfig);
                    break;
                case "panel":
                    switch(command.panel) {
                        case "credits":
                            this.creditsDOM.setVisible(command.open);
                            break;
                        case "customgametab":
                            if (command.open) {
                                if (!this.customGameTab) this.customGameTab = new CustomGameTab((data: PlaySceneData) => scene.scene.start("play", data));
                            } else {
                                if (this.customGameTab) {
                                    this.customGameTab.terminate();
                                    this.customGameTab = null;
                                }
                            }
                            break;
                        case "settings":
                            setSettingsVisible(command.open);
                            break;
                    }
                    break;
            }
        });

        this.events.on("shutdown", () => {
            if (this.customGameTab) {
                this.customGameTab.terminate();
            }
            destroySettingsPanel();

            this.events.off("shutdown");
        });
    }

    update() {
        this.menuObj.update();
    }
}
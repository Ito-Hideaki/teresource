import Phaser from "phaser";
import { createConfigPanel } from "./settingspanel";
import { PlaySceneData } from "../play";
import { GameSession } from "../play/controller/gamesession";
import { GameConfig } from "../play/controller/game";

export class CustomGameTab {

    private panel;

    constructor(private scene: Phaser.Scene) {
        this.panel = createConfigPanel("position: absolute; top: 0; right: 0; height: 100%; width: 70%;", ["objective", "game", "handling", "personalization", "autoDamage"]);
    }

    play() {
        //start play scene
    }

    terminate() {
        this.panel.destroyPanel();
    }
}
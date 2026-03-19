import Phaser from "phaser";
import { MINO_DATA_INDEX } from "./play/core/coredata";
import { cellImgSkins } from "./play/view/viewdata";
import { SingleGame } from "./play/controller/game";
import { ControlOrder, ControlOrderProvider, KeyInputProcessor } from "./play/controller/controlorder";
import { CellSheetParent, loadCellSkinTextures } from "./play/view/customtexture";
import { viteURLify } from "#util";
import { ConfigUIDataHandler } from "../configUI";
import { LinearDamageProvider } from "./play/core/garbage";

/** Load textures that are used to create next level textures @param {Phaser.Scene} scene */
export function loadFirstLevelTextures(scene) {
    // url style must be like: viteURLify("/image/path/to/file.png");
    /** First-level textures */
    loadCellSkinTextures(scene);
}

/**create textures using loaded textures. Only executable once. @param {Phaser.Scene} scene */
export function createSecondLevelTextures(scene) {
    /** @type {Object.<string, CellSheetParent>} */
    const cellSheetParentIndex = {};
    cellImgSkins.forEach(skin => {
        cellSheetParentIndex[skin] = new CellSheetParent(scene, skin);
    });
    return cellSheetParentIndex;
}

/**
 * @typedef {{
 *      players: {
 *          keyBinding: {
 *              game: import("./play/controller/controlorder").KeyBindingConfig;
 *              reload: string[];
 *          };
 *          game: import("./play/controller/game").GameConfig;
 *          reloadKey: string;
 *      }[];
 *      session: import("./play/controller/gamesession").GameSessionConfig;
 *  }} MatchConfig
 * */


/**
 * @extends Phaser.Scene
 */
export class PlayScene extends Phaser.Scene {

    width;
    height;

    games;

    /** @type {SingleGame} */ #singleGame;

    constructor() {
        super({
            key: "play"
        });
    }

    preload() {
        // url style must be like: viteURLify("/image/path/to/file.png");
        //cell textures are already loaded on BootloaderScene
        this.load.image("subminoview_back", viteURLify("/image/subminoview_back.jpg"));
    }

    create(data) {

        this.cellSheetParentIndex = this.game.cellSheetParentIndex;

        /** @type {Object.<string, ConfigUIDataHandler>} */ const configUIDataHandlerMap = this.game.configUIDataHandlerMap;

        /** @type {MatchConfig} */
        const matchConfig = data.matchConfig;

        this.players = matchConfig.players.map(playerConfig => {
            const game = new SingleGame(this, playerConfig.game);
            const container = game.gameViewController.boardContainer;
            container.x = this.game.canvas.width / 2;
            container.y = this.game.canvas.height / 2;
            game.gameUpdator.setSessionFromConfig(matchConfig.session);
            const keyInputProcessor = new KeyInputProcessor(playerConfig.keyBinding.game, game.controlOrderProvider);
            return { game, keyInputProcessor, keyBinding: playerConfig.keyBinding };
        });

        this.input.keyboard.on("keydown", e => {
            if (!this.game.inputEnabled) return;
            e.preventDefault();
            if (e.repeat) return;

            for (const player of this.players) {
                if (player.keyBinding.reload.includes(e.code)) {
                    this.scene.start("play");
                }

                player.keyInputProcessor.keyDown(e.code);
            }
        });

        this.input.keyboard.on("keyup", e => {
            if (!this.game.inputEnabled) return;

            for (const player of this.players) {
                player.keyInputProcessor.keyUp(e.code);
            }
        })

        const rebootButton = this.add.dom(300, 100, "div", "font-size: 20px; background-color: yellow; padding: 10px; border: 5px solid #aa0; user-select: none;", "Reboot Scene");
        rebootButton.addListener("click");
        rebootButton.on("click", e => {
            this.scene.start("play");
        });
    }


    update(time, delta) {
        const deltaTime = delta / 1000;

        this.players.forEach(player => {
            const gameUpdateResult = player.game.gameUpdator.update(deltaTime);
            player.game.gameViewController.update(deltaTime);
        });
    }
}
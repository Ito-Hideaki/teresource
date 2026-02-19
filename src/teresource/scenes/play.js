import Phaser from "phaser";
import { MINO_DATA_INDEX } from "./play/core/coredata";
import { cellImgSkins } from "./play/view/viewdata";
import { SingleGame } from "./play/controller/game";
import { ControlOrder, ControlOrderProvider } from "./play/controller/controlorder";
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
 * @extends Phaser.Scene
 */
export class PlayScene extends Phaser.Scene {

    width;
    height;

    #singleGame;

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

    create() {
        this.cellSheetParentIndex = this.game.cellSheetParentIndex;

        /** @type {Object.<string, ConfigUIDataHandler>} */ const configUIDataHandlerMap = this.game.configUIDataHandlerMap;

        /** @type {import("./play/controller/game").GameConfig} */ const gameConfig = {
            bag: {
                minoTypeToUseList: Object.keys(MINO_DATA_INDEX)
            },
            ...configUIDataHandlerMap.game.getConfig(),
            personalization: configUIDataHandlerMap.personalization.getConfig(),
            handling: configUIDataHandlerMap.handling.getConfig(),
            autoDamage: configUIDataHandlerMap.autoDamage.getConfig()
        }
        this.#singleGame = new SingleGame(this, gameConfig);
        const container = this.#singleGame.gameViewController.boardContainer;
        container.x = this.game.canvas.width / 2;
        container.y = this.game.canvas.height / 2;

        const UIObjectiveConfig = this.game.configUIDataHandlerMap.objective.getConfig();
        /** @type {import("./play/controller/gamesession").GameSessionConfig} */ const sessionConfig = UIObjectiveConfig.session;
        this.#singleGame.gameUpdator.setSessionFromConfig(sessionConfig);

        this.input.keyboard.on("keydown", e => {
            if(!this.game.inputEnabled) return;
            e.preventDefault();
            if (e.repeat) return;

            if(e.code === "KeyR") {
                this.scene.start("play");
            }

            //list of controlOrders assigned to a perticulay key
            const controlOrderList = {
                "ArrowLeft" : ControlOrder.START_MOVE_LEFT,
                "ArrowRight": ControlOrder.START_MOVE_RIGHT,
                "ArrowDown" : ControlOrder.START_SOFT_DROP,
                "KeyX"      : ControlOrder.ROTATE_CLOCK_WISE,
                "KeyZ"      : ControlOrder.ROTATE_COUNTER_CLOCK,
                "Space"     : ControlOrder.HARD_DROP,
                "KeyC"      : ControlOrder.HOLD,
                "ShiftLeft" : ControlOrder.HOLD
            }
            if (Object.keys(controlOrderList).includes(e.code)) {
                this.#singleGame.controlOrderProvider.setNewPlayerInput(controlOrderList[e.code]);
            }
        });

        this.input.keyboard.on("keyup", e => {
            if(!this.game.inputEnabled) return;
            //list of controlOrders assigned to a perticulay key
            const controlOrderList = {
                "ArrowLeft": ControlOrder.STOP_MOVE_LEFT,
                "ArrowRight": ControlOrder.STOP_MOVE_RIGHT,
                "ArrowDown": ControlOrder.STOP_SOFT_DROP,
            }
            if (Object.keys(controlOrderList).includes(e.code)) {
                e.preventDefault();
                this.#singleGame.controlOrderProvider.setNewPlayerInput(controlOrderList[e.code]);
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

        const gameUpdateResult = this.#singleGame.gameUpdator.update(deltaTime);

        //auto damage
        if(gameUpdateResult.placed) {
            this.#singleGame.damageProviderPerMino.count();
            const damages = this.#singleGame.damageProviderPerMino.provide();
            for(const damage of damages) this.#singleGame.gameUpdator.scheduledDamageState.damageStack.push({ length: damage });
        }

        this.#singleGame.gameViewController.update(deltaTime);
    }
}
import Phaser from "phaser";
import { MINO_DATA_INDEX } from "./play/core/coredata";
import { GameController } from "./play/controller/gamecontroller";
import { GameViewController } from "./play/view/gameviewcontroller";
import { cellImgSkins, cellImgSkins_fromImgs, cellImgSkins_fromSheet, IMG_SKIN_DATA_INDEX } from "./play/view/viewdata";
import { calcSkinCellViewParams, generateCellSheetTextureKey, generateCellSheetTextureUrl, generateCellTextureKey, generateCellTextureUrl } from "./play/view/viewmechanics";
import { GameFactory } from "./play/infra/gamefactory";
import { ControlOrder, ControlOrderProvider } from "./play/controller/boardcontroller";
import { CellSheetParent } from "./play/view/customtexture";
import { viteURLify } from "#util";
import { ConfigUIDataHandler } from "../configUI";
import { GameSession } from "./play/controller/gamesession";

/** Load textures that are used to create next level textures @param {Phaser.Scene} scene */
export function loadFirstLevelTextures(scene) {
    // url style must be like: viteURLify("/image/path/to/file.png");
    /** First-level textures */
    cellImgSkins_fromImgs.forEach(skin => {
        const cellViewParamsList = calcSkinCellViewParams(skin);
        cellViewParamsList.forEach(cellViewParams => {
            const key = generateCellTextureKey(cellViewParams);
            const url = generateCellTextureUrl(cellViewParams);
            scene.load.image(key, viteURLify(url));
        })
    });
    cellImgSkins_fromSheet.forEach(skin => {
        const key = generateCellSheetTextureKey(skin);
        const url = generateCellSheetTextureUrl(skin);
        scene.load.image(key, viteURLify(url));
    });
}

/**create textures using loaded textures. Only executable once. @param {Phaser.Scene} scene */
export function createSecondLevelTextures(scene) {
    /** @type {Object.<string, CellSheetParent>} */
    const cellSheetParentIndex = {};
    cellImgSkins.forEach(skin => {
        cellSheetParentIndex[skin] = new CellSheetParent(scene, skin, IMG_SKIN_DATA_INDEX[skin].cellWidth);
    });
    return cellSheetParentIndex;
}


/**
 * @extends Phaser.Scene
 */
export class PlayScene extends Phaser.Scene {

    width;
    height;
    /** @type {GameController} */
    #gameController;
    /** @type {GameViewController} */
    #gameViewController;
    /** @type {ControlOrderProvider} */
    #controlOrderProvider;

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

        /** @type {import("./play/infra/gamefactory").GameConfig} */ const gameConfig = {
            bag: {
                minoTypeToUseList: Object.keys(MINO_DATA_INDEX)
            },
            ...configUIDataHandlerMap.game.getConfig(),
            personalization: configUIDataHandlerMap.personalization.getConfig(),
            handling: configUIDataHandlerMap.handling.getConfig(),
        }
        const gameElements = GameFactory.create(this, gameConfig);
        this.#gameController = gameElements.gameController;
        this.#gameViewController = gameElements.gameViewController;
        this.#controlOrderProvider = gameElements.controlOrderProvider;

        const UIObjectiveConfig = this.game.configUIDataHandlerMap.objective.getConfig();
        /** @type {import("./play/controller/gamesession").GameSessionConfig} */ const sessionConfig = UIObjectiveConfig.session;
        this.#gameController.setSessionFromConfig(sessionConfig);

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
                this.#controlOrderProvider.setNewPlayerInput(controlOrderList[e.code]);
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
                this.#controlOrderProvider.setNewPlayerInput(controlOrderList[e.code]);
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
        this.#gameController.update(deltaTime);
        this.#gameViewController.update(deltaTime);
    }
}
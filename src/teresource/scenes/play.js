import Phaser from "phaser";
import { MINO_DATA_LIST } from "./play/core/coredata";
import { GameController } from "./play/controller/gamecontroller";
import { ViewController } from "./play/view/viewcontroller";
import { calcSkinCellViewParams, cellGraphicSkins, cellImgSkins, cellImgSkins_fromImgs, cellImgSkins_fromSheet, generateCellSheetTextureKey, generateCellSheetTextureUrl, generateCellTextureKey, generateCellTextureUrl } from "./play/view/viewmechanics";
import { GameFactory } from "./play/infra/gamefactory";
import { ControlOrder, ControlOrderProvider } from "./play/controller/boardcontroller";
import { CellSheetParent } from "./play/view/customtexture";
import { viteURLify } from "#util";




/**
 * @extends Phaser.Scene
 */
export class PlayScene extends Phaser.Scene {

    width;
    height;
    /** @type {GameController} */
    #gameController;
    /** @type {ViewController} */
    #viewController;
    /** @type {ControlOrderProvider} */
    #controlOrderProvider;

    constructor() {
        super({
            key: "play"
        });
    }

    preload() {
        // url style must be like: viteURLify("/image/path/to/file.png");
        /** First-level textures */
        cellImgSkins_fromImgs.forEach(skin => {
            const cellViewParamsList = calcSkinCellViewParams(skin);
            cellViewParamsList.forEach(cellViewParams => {
                const key = generateCellTextureKey(cellViewParams);
                const url = generateCellTextureUrl(cellViewParams);
                this.load.image(key, viteURLify(url));
            })
        })
        cellImgSkins_fromSheet.forEach(skin => {
            const key = generateCellSheetTextureKey(skin);
            const url = generateCellSheetTextureUrl(skin);
            this.load.image(key, viteURLify(url));
        })
        this.load.image("subminoview_back", viteURLify("/image/subminoview_back.jpg"));
    }

    create() {
        /** @type {Object.<string, CellSheetParent>} */
        this.cellSheetParentIndex = {};
        /* Second-level textures */
        cellImgSkins.forEach(skin => {
            this.cellSheetParentIndex[skin] = new CellSheetParent(this, skin);
        });
        document.body.appendChild(this.textures.get(generateCellSheetTextureKey("nine")).getSourceImage());

        /** @type {import("./play/infra/gamefactory").GameConfig} */ const gameConfig = {
            bag: {
                minoTypeToUseList: Object.keys(MINO_DATA_LIST)
            }
        }
        const gameElements = GameFactory.create(this, gameConfig);
        this.#gameController = gameElements.gameController;
        this.#viewController = gameElements.viewController;
        this.#controlOrderProvider = gameElements.controlOrderProvider;

        this.input.keyboard.on("keydown", e => {
            if (e.repeat) {
                e.preventDefault(); return;
            }
            //list of controlOrders assigned to a perticulay key
            const controlOrderList = {
                "ArrowLeft": ControlOrder.START_MOVE_LEFT,
                "ArrowRight": ControlOrder.START_MOVE_RIGHT,
                "ArrowDown": ControlOrder.START_SOFT_DROP,
                "KeyX": ControlOrder.ROTATE_CLOCK_WISE,
                "KeyZ": ControlOrder.ROTATE_COUNTER_CLOCK,
                "Space": ControlOrder.HARD_DROP,
            }
            if (Object.keys(controlOrderList).includes(e.code)) {
                e.preventDefault();
                this.#controlOrderProvider.setNewPlayerInput(controlOrderList[e.code]);
            }
        });

        this.input.keyboard.on("keyup", e => {
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
    }

    update(time, delta) {
        const deltaTime = delta / 1000;
        this.#gameController.update(deltaTime);
        this.#viewController.update(deltaTime);
    }
}
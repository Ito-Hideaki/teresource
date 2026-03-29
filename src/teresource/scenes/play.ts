import Phaser from "phaser";
import { cellImgSkins } from "./play/view/viewdata";
import { GameConfig, SingleGame } from "./play/controller/game";
import { KeyBindingConfig, KeyInputProcessor } from "./play/controller/controlorder";
import { CellSheetParent, loadCellSkinTextures } from "./play/view/customtexture";
import { viteURLify } from "#util";
import { GameSessionConfig } from "./play/controller/gamesession";
import { ConfigUIDataHandler } from "../configUI";
import { ConfigCategory } from "../configUIData";
import { TBPHandler } from "./play/controller/tbp";

/** Load textures that are used to create next level textures @param {Phaser.Scene} scene */
export function loadFirstLevelTextures(scene: Phaser.Scene) {
    // url style must be like: viteURLify("/image/path/to/file.png");
    /** First-level textures */
    loadCellSkinTextures(scene);

    //ordinary textures
    scene.load.image("subminoview_back", viteURLify("/image/subminoview_back.jpg"));
    scene.load.image("scheduled_damage_cell", viteURLify("image/scheduled_damage_cell.png"));
    scene.load.on(
        "filecomplete-image-scheduled_damage_cell",
        (key: string) => {
            const texture = scene.textures.get(key);
            texture.add("arriving", 0, 0, 0, 12, 12);
            texture.add("arrived", 0, 12, 0, 12, 12);
        }
    );
}

/**create textures using loaded textures. Only executable once. @param {Phaser.Scene} scene */
export function createSecondLevelTextures(scene: Phaser.Scene) {
    const cellSheetParentIndex: { [key: string]: CellSheetParent } = {};
    cellImgSkins.forEach(skin => {
        cellSheetParentIndex[skin] = new CellSheetParent(scene, skin);
    });
    return cellSheetParentIndex;
}

export type PlaySceneData = {
    matchConfig: MatchConfig
}

type PlayerKeyboardControlConfig = {
    type: "keyboard";
    game: KeyBindingConfig;
    reload: string[];
    quit: string[];
};

type PlayerBotControlConfig = {
    type: "bot";
}

type PlayerConfig = {
    control: PlayerKeyboardControlConfig | PlayerBotControlConfig;
    game: GameConfig;
}

type MatchConfig = {
    players: PlayerConfig[];
    session: GameSessionConfig;
    sendAttackToOthers: boolean;
    sendAttackToMyself: boolean;
}

type PlayerKeyboardControl = {
    keyInputProcessor: KeyInputProcessor;
} & PlayerKeyboardControlConfig;

type PlayerBotControl = {
    handler: TBPHandler;
} & PlayerBotControlConfig;

type Player = {
    game: SingleGame;
    control: PlayerKeyboardControl | PlayerBotControl;
};

export class PlayScene extends Phaser.Scene {

    //@ts-ignore
    game: Phaser.Game & { inputEnabled: boolean };

    //@ts-ignore
    players: Player[];
    //@ts-ignore
    cellSheetParentIndex: { [key: string]: CellSheetParent };

    //@ts-ignore
    sendAttackToOthers: boolean;
    //@ts-ignore
    sendAttackToMyself: boolean;

    //@ts-ignore
    private singleGame;

    constructor() {
        super({
            key: "play"
        });
    }

    preload() {
        // url style must be like: viteURLify("/image/path/to/file.png");
        //most of textures are already loaded on BootloaderScene
    }

    create(data: PlaySceneData) {

        //@ts-ignore
        this.cellSheetParentIndex = this.game.cellSheetParentIndex as { [key: string]: CellSheetParent };
        //@ts-ignore
        const configUIDataHandlerMap = this.game.configUIDataHandlerMap as { [key in ConfigCategory]: ConfigUIDataHandler };

        const matchConfig = data.matchConfig;
        const playerNumber = matchConfig.players.length;

        this.players = matchConfig.players.map((playerConfig, i) => {
            const game = new SingleGame(this, playerConfig.game);
            const container = game.gameViewController.boardContainer;
            container.scale = 4 / (playerNumber + 3);
            container.x = this.game.canvas.width * ((i + 0.5) / playerNumber);
            container.y = this.game.canvas.height / 2;
            game.gameUpdator.setSessionFromConfig(matchConfig.session);

            const control: Player["control"] = (() => {
                switch (playerConfig.control.type) {
                    case "keyboard":
                        const keyInputProcessor = new KeyInputProcessor(playerConfig.control.game, game.controlOrderProvider);
                        return { keyInputProcessor, ...playerConfig.control };
                    case "bot":
                        const handler = new TBPHandler(game.gameContext);
                        return { handler, ...playerConfig.control };
                }
            })();
            return { game, control };
        });

        this.sendAttackToMyself = matchConfig.sendAttackToMyself;
        this.sendAttackToOthers = matchConfig.sendAttackToOthers;

        this.input.keyboard?.on("keydown", (e: KeyboardEvent) => {
            if (!this.game.inputEnabled) return;
            e.preventDefault();
            if (e.repeat) return;

            for (const player of this.players) {
                if (player.control.type === "keyboard") {
                    if (player.control.reload.includes(e.code)) this.reload();
                    else if (player.control.quit.includes(e.code)) this.quit();

                    player.control.keyInputProcessor.keyDown(e.code);
                }
            }
        });
        this.input.keyboard?.on("keyup", (e: KeyboardEvent) => {
            if (!this.game.inputEnabled) return;

            for (const player of this.players) {
                if (player.control.type === "keyboard") {
                    player.control.keyInputProcessor.keyUp(e.code);
                }
            }
        });

        const rebootButton = this.add.dom(200, 100, "div", "font-size: 20px; background-color: yellow; padding: 10px; border: 5px solid #aa0; user-select: none;", "New Game");
        rebootButton.addListener("click");
        rebootButton.on("click", this.reload, this);

        const quitButton = this.add.dom(350, 100, "div", "font-size: 20px; background-color: yellow; padding: 10px; border: 5px solid #aa0; user-select: none;", "Quit");
        quitButton.addListener("click");
        quitButton.on("click", this.quit, this);
    }


    update(time: number, delta: number) {
        const deltaTime = delta / 1000;

        this.players.forEach(player => {
            if(player.control.type !== "bot") return;

            const controlOrder = player.control.handler.update();
            player.game.controlOrderProvider.setNewPlayerInput(controlOrder.value);
        })

        this.players.forEach(player => {
            const gameUpdator = player.game.gameUpdator;
            const { outgoingAttack } = gameUpdator.update(deltaTime);
            if (!outgoingAttack) return;
            const playersToSend = this.players.filter(target => {
                return this.sendAttackToMyself && target === player || this.sendAttackToOthers && target !== player
            });
            playersToSend.forEach(target => {
                target.game.gameUpdator.addScheduledDamage(outgoingAttack.amount, outgoingAttack.delay_s);
            });
        });

        this.players.forEach(player => {
            player.game.gameViewController.update(deltaTime);
        });
    }

    reload() {
        this.scene.start("play");
    }

    quit() {
        this.scene.start("menu");
    }
}
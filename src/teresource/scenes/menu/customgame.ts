import { createConfigPanel } from "./settingspanel";
import { PlaySceneData } from "../play";
import { GameSession } from "../play/controller/gamesession";
import { GameConfig } from "../play/controller/game";
import { MINO_DATA_INDEX } from "../play/core/coredata";

export class CustomGameTab {

    private panel;

    constructor(private startPlayScene: (data: PlaySceneData) => void) {
        this.panel = createConfigPanel("position: absolute; top: 0; right: 0; height: 100%; width: 70%;", ["objective", "game", "handling", "personalization", "autoDamage"]);
    }

    play(keyBindingConfig: any) {
        const gameConfig = {
            bag: {
                minoTypeToUseList: Object.keys(MINO_DATA_INDEX)
            },
            ...this.panel.configUIDataHandlerMap.game.getConfig(),
            personalization: this.panel.configUIDataHandlerMap.personalization.getConfig(),
            handling: this.panel.configUIDataHandlerMap.handling.getConfig(),
            autoDamage: this.panel.configUIDataHandlerMap.autoDamage.getConfig()
        } as GameConfig;
        const matchConfig: PlaySceneData["matchConfig"] = {
            players: [{
                // @ts-ignore
                control: { type: "keyboard", ...keyBindingConfig },
                game: gameConfig
            }],
            session: { type: GameSession.SessionType.None, targetLines: 0, timeLimit: 0 },
            sendAttackToMyself: false,
            sendAttackToOthers: false
        };
        this.startPlayScene({ matchConfig });
    }

    terminate() {
        this.panel.destroyPanel();
    }
}
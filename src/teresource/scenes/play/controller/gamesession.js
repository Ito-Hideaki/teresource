import { GameHighContext } from "../infra/context";
import { GameStats } from "./stats";

export class GameSession {

    static SessionType = {
        None: "None",
        Line: "Line"
    }

    //Readonly
    type = GameSession.SessionType.None;
    /** @type {number} */ targetLines;
    /** @type {boolean} */ isOver = false;

    /** @type {GameStats} */ #gameStats;

    /** @param {GameHighContext} gameHighContext */
    constructor(gameHighContext) {
        this.#gameStats = gameHighContext.gameStats;

        this.type = GameSession.SessionType.Line;
        this.targetLines = 40;
    }

    isTargetCompleted() {
        switch (this.type) {
            case GameSession.SessionType.Line:
                return this.#gameStats.clearedLines >= this.targetLines;
            case GameSession.SessionType.None:
            default:
                return false;
        }
    }

    markAsOver() {
        this.isOver = true;
    }
}
import { GameHighContext } from "../infra/context";
import { GameStats } from "./stats";

/**
 *  @typedef {{
 *      type: string,
 *      targetLines: number
 *  }}
 * GameSessionConfig */

export class GameSession {

    static SessionType = {
        None: "None",
        Line: "Line",
        Timed: "Timed"
    }

    //Readonly
    type = GameSession.SessionType.None;
    /** @type {number} */ targetLines;
    /** @type {boolean} */ isOver = false;

    /** @type {GameStats} */ #gameStats;

    /** @param {GameHighContext} gameHighContext @param {GameSessionConfig} config */
    constructor(gameHighContext, config) {
        this.#gameStats = gameHighContext.gameStats;

        this.type = config.type;
        this.targetLines = config.targetLines;
        this.timeLimit = config.timeLimit;
    }

    isTargetCompleted() {
        switch (this.type) {
            case GameSession.SessionType.Line:
                return this.#gameStats.clearedLines >= this.targetLines;
            case GameSession.SessionType.Timed:
                return this.#gameStats.timePassed >= this.timeLimit;
            case GameSession.SessionType.None:
            default:
                return false;
        }
    }

    markAsOver() {
        this.isOver = true;
    }
}
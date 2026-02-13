import { LineClearAttackData } from "../core/attack";

/** @param {LineClearAttackData} data */
function getLineClearScore(data) {
    let score = 0;

    if(data.isSpecial) {
        const isSingleMini = data.isMini && data.clearedRowList.length === 1;
        if(isSingleMini) score += 6;
        else score += data.clearedRowList.length * 8;
    } else {
        score += data.clearedRowList.length ** 2;
    }

    if(data.B2B) score *= 1.5;

    if(data.combo) {
        const comboFactor = Math.min(data.combo, 10);
        score += 0.5 * comboFactor;
    }

    if(data.isAllClear) score += 50;

    return Math.round(score);
}

export class GameStats {
    /** @type {number} */ clearedLines = 0;
    /** @type {number} */ score = 0;
    /** @type {number} */ level = 1;
    /** @type {number} */ timePassed = 0;
}

export class GameStatsManager {
    #startLevel
    /** @param {GameStats} stats @param {number} startLevel */
    constructor(stats, startLevel) {
        this.stats = stats;
        this.#startLevel = startLevel;
        stats.level = startLevel;
    }

    /** Should be called before update() @param {LineClearAttackData} lineClearAttackData  */
    setNewLineClearAttackData(lineClearAttackData) {
        this.lineClearAttackData = lineClearAttackData;
    }

    /** @param {number} deltaTime */
    update(deltaTime) {
        this.stats.timePassed += deltaTime;

        //level up
        if(this.stats.clearedLines >= (this.stats.level - this.#startLevel + 1) * 10) {
            this.stats.level = this.#startLevel + Math.floor(this.stats.clearedLines / 10);
            window.log("level up");
        }

        if(this.lineClearAttackData) {
            this.stats.clearedLines += this.lineClearAttackData.clearedRowList.length;
            this.stats.score += getLineClearScore(this.lineClearAttackData);
        }

        //Ready for next frame
        this.lineClearAttackData = undefined;
    }
}
import { LineClearAttackData } from "../core/attack";

export class GameStats {
    /** @type {number} */ clearedLines = 0
}

export class GameStatsManager {
    /** @param {GameStats} stats */
    constructor(stats) {
        this.stats = stats;
    }

    /** Should be called before update() @param {LineClearAttackData} lineClearAttackData  */
    setNewLineClearAttackData(lineClearAttackData) {
        this.lineClearAttackData = lineClearAttackData;
    }

    update() {
        if(this.lineClearAttackData) {
            this.stats.clearedLines += this.lineClearAttackData.clearedRowList.length;
            console.log(`total ${this.stats.clearedLines}`);
        }

        //Ready for next frame
        this.lineClearAttackData = undefined;
    }
}
import { LineClearAttackData } from "../core/attack";


/** Object that is used to tell what has happened in the last frame.
 *  The data inside must not be changed.  */
export class Report {
    static type = "Default";
    data;
    parentClass = Report;
    getData() {
        return this.data;
    }
}

export class LineClearReport extends Report {
    static type = "LineClear";
    parentClass = LineClearReport;
    data;
    /** @param {LineClearAttackData} data */
    constructor(data) {
        super();
        this.data = data;
    }
}

/** contain report stacks that become empty every frame */
export class ReportStack {
    constructor() {
        this.renewAll();
    }

    /** @param {Report} report */
    add(report) {
    }

    renewAll() {
    }
}

export class GameReportStack {
    /** @type {LineClearReport[]} */ lineClear;
    /** @type {MinoSpawnReport[]} */ minoSpawn;

    /** @param {Report} report */
    add(report) {
        switch(report.parentClass.type) {
            case LineClearReport.type:
                this.lineClear.push(report);
                break;
            case MinoSpawnReport.type:
                this.minoSpawn.push(report);
                break;
        }
    }

    renewAll() {
        this.lineClear = [];
        this.minoSpawn = [];
    }
}
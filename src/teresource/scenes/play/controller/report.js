import { LineClearAttackData } from "../core/attack";
import { Cell } from "../core/mechanics";


/** Object that is used to tell what has happened in the last frame.
 *  The data inside must not be changed.  */
export class Report {
    static type = "Default";
    parentClass = Report;
}

export class LineClearReport extends Report {
    static type = "LineClear";
    parentClass = LineClearReport;
    data;
    rowList;
    /** @param {LineClearAttackData} data @param {Cell[][]} rowList */
    constructor(data, rowList) {
        super();
        this.data = data;
        this.rowList = rowList;
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
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

export class RecieveScheduledDamageReport extends Report {
    static type = "RecieveScheduledDamage";
    parentClass = RecieveScheduledDamageReport;
    scheduledDamage;
    /** @param {import("../core/garbage").ScheduledDamage} scheduledDamage */
    constructor(scheduledDamage) {
        super();
        this.scheduledDamage = scheduledDamage;
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
    /** @type {RecieveScheduledDamageReport[]} */ recieveScheduledDamage;

    /** @param {Report} report */
    add(report) {
        switch(report.parentClass.type) {
            case LineClearReport.type:
                this.lineClear.push(report);
                break;
            case RecieveScheduledDamageReport.type:
                this.recieveScheduledDamage.push(report);
                break;
        }
    }

    renewAll() {
        this.lineClear = [];
        this.recieveScheduledDamage = [];
    }
}
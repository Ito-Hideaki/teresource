import { LineClearAttackData } from "../core/attack";
import { ScheduledDamage } from "../core/garbage";
import { Cell } from "../core/mechanics";

export class LineClearReport {
    readonly type = "LineClear";
    constructor(public data: LineClearAttackData, public rowList: Cell[][]) {}
}

export class RecieveScheduledDamageReport {
    readonly type = "RecieveScheduledDamage";
    parentClass = RecieveScheduledDamageReport;
    constructor(public scheduledDamage: ScheduledDamage) {}
}

/** contain report stacks that become empty every frame */
export class ReportStack {
    constructor() {
        this.renewAll();
    }
    renewAll() {
    }
}

export class GameReportStack {
    lineClear: LineClearReport[] = [];
    recieveScheduledDamage: RecieveScheduledDamageReport[] = [];

    add(report: LineClearReport | RecieveScheduledDamageReport) {
        switch(report.type) {
            case "LineClear":
                this.lineClear.push(report);
                break;
            case "RecieveScheduledDamage":
                this.recieveScheduledDamage.push(report);
                break;
        }
    }

    renewAll() {
        this.lineClear = [];
        this.recieveScheduledDamage = [];
    }
}
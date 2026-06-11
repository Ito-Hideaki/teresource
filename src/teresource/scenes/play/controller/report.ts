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

export class MinoHorizontalMoveReport {
    readonly type = "MinoHorizontalMove";
}

export class MinoRotateReport {
    readonly type = "MinoRotate";
}

export class HardDropReport {
    readonly type = "HardDrop";
}

export class MinoFallReport {
    readonly type = "MinoFall";
}

export class SpecialRotateReport {
    readonly type = "SpecialRotate";
}

/** contain report stacks that become empty every frame */
export class ReportStack {
    constructor() {
        this.renewAll();
    }
    renewAll() {
    }
}

type GameReport = LineClearReport | RecieveScheduledDamageReport | MinoHorizontalMoveReport | MinoFallReport | MinoRotateReport | HardDropReport | SpecialRotateReport;

export class GameReportStack {
    lineClear: LineClearReport[] = [];
    recieveScheduledDamage: RecieveScheduledDamageReport[] = [];
    minoHorizontalMove: MinoHorizontalMoveReport[] = [];
    minoFall: MinoFallReport[] = [];
    minoRotate: MinoRotateReport[] = [];
    hardDrop: HardDropReport[] = [];
    specialRotate: SpecialRotateReport[] = [];

    add(report: GameReport) {
        switch(report.type) {
            case "LineClear":
                this.lineClear.push(report);
                break;
            case "RecieveScheduledDamage":
                this.recieveScheduledDamage.push(report);
                break;
            case "HardDrop":
                this.hardDrop.push(report);
                break;
            case "MinoFall":
                this.minoFall.push(report);
                break;
            case "MinoHorizontalMove":
                this.minoHorizontalMove.push(report);
                break;
            case "MinoRotate":
                this.minoRotate.push(report);
                break;
            case "SpecialRotate":
                this.specialRotate.push(report);
                break;
        }
    }

    renewAll() {
        this.lineClear = [];
        this.recieveScheduledDamage = [];
        this.minoHorizontalMove = [];
        this.minoRotate = [];
        this.minoFall = [];
        this.hardDrop = [];
        this.specialRotate = [];
    }
}
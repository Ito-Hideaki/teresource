import { LineClearAttackData } from "../core/attack";
import { ScheduledDamage } from "../core/garbage";
import { Cell } from "../core/mechanics";

export type LineClearReport = {
    type: "LineClear";
    data: LineClearAttackData;
    rowList: Cell[][];
}

export type ReceiveScheduledDamageReport = {
    type: "ReceiveScheduledDamage";
    scheduledDamage: ScheduledDamage;
}

export type MinoHorizontalMoveReport = {
    type: "MinoHorizontalMove";
}

export type MinoRotateReport  = {
    type: "MinoRotate";
}

export type HardDropReport = {
    type: "HardDrop";
}

export type MinoFallReport = {
    type: "MinoFall";
}

export type SpecialRotateReport = {
    type: "SpecialRotate";
}

export type HoldReport = {
    type: "Hold";
}

//type Report = LineClearReport | ReceiveScheduledDamageReport | MinoHorizontalMoveReport | MinoFallReport | MinoRotateReport | HardDropReport | SpecialRotateReport;

type Reports = {
    LineClear: LineClearReport;
    ReceiveScheduledDamage: ReceiveScheduledDamageReport;
    MinoHorizontalMove: MinoHorizontalMoveReport;
    MinoFall: MinoFallReport;
    MinoRotate: MinoRotateReport;
    HardDrop: HardDropReport;
    SpecialRotate: SpecialRotateReport;
    Hold: HoldReport;
}

type ReportStore<T extends keyof Reports> = {
    [Key in T]: Array<Reports[Key]> 
}

function createReportStore<T extends Array<keyof Reports>>(reportKeys: T) {
    const store = {} as ReportStore<T[number]>;
    reportKeys.forEach((key: T[number]) => {
        store[key] = [];
    });
    return store;
}

class ReportStack<T extends keyof Reports> {
    store: ReportStore<T>;
    private reportKeys: T[];
    constructor(reportKeys: T[]) {
        this.reportKeys = reportKeys;
        this.store = createReportStore(this.reportKeys);
    }
    add<S extends T>(report: Reports[S]) {
        const type = report.type as S;
        this.store[type].push(report);
    }
    renewAll() {
        this.store = createReportStore(this.reportKeys);
    }
}

const GAME_REPORT_KEYS = ["LineClear", "ReceiveScheduledDamage", "MinoHorizontalMove", "MinoFall", "MinoRotate", "HardDrop", "SpecialRotate", "Hold"] as const;
type GameReportKey = typeof GAME_REPORT_KEYS[number];
//type GameReport = Reports[GameReportKey];

export class GameReportStack extends ReportStack<GameReportKey> {
    constructor() {
        super(GAME_REPORT_KEYS.slice());
    }
}
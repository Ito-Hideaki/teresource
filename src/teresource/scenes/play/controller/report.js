

/** Object that is used to tell what has happened in the last frame.
 *  The data inside must not be changed.  */
export class Report {
    getType() { return "Default" }
    getData() { }
}

export class LineClearReport extends Report {
    /** @typedef {{ code: string, rowToClearList: number[] }} LineClearReportData */
    getType() { return "LineClear" }
    #data;
    /** @param {LineClearReportData} data */
    constructor(data) {
        this.#data = data;
    }
    getData() {
        return this.#data;
    }
}

export class ReportStack {
    /** @type {LineClearReport} */ LineClear;

    constructor(type) {
        this.renewAll();
    }

    /** @param {Report} report */
    add(report) {
        switch(report.getType()) {
            case "LineClear":
                this.LineClear.push(report);
                break;
        }
    }

    renewAll() {
        this.LineClear = [];
    }
}
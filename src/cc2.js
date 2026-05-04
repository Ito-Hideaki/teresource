import { viteURLify } from "#util";

export class CC2Handler {
    #worker;
    #listener;

    constructor(listener) {
        this.#worker = new Worker(viteURLify("cc2/worker.js"), { type: "module" });
        this.#listener = listener;

        this.#worker.onmessage = e => {
            this.#listener(JSON.parse(e.data));
        };
    }

    sendMessageObject(obj) {
        this.#worker.postMessage(JSON.stringify(obj));
    }
}

function wait(delay) {
    return new Promise(res => {
        setTimeout(res, delay);
    });
}
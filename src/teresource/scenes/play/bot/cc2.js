import { viteURLify } from "#util";

export class CC2Handler {
    #worker;
    #listener;
    #terminated = false;

    constructor(listener) {
        this.#worker = new Worker(viteURLify("cc2/worker.js"), { type: "module" });
        this.#listener = listener;

        this.#worker.onmessage = e => {
            this.#listener(JSON.parse(e.data));
        };
    }

    sendMessageObject(obj) {
        if(this.#terminated) {
            throw "Error: This cc2 worker has terminated";
        } else {
            this.#worker.postMessage(JSON.stringify(obj));
        }
    }

    terminate() {
        if(!this.#terminated) {
            this.#terminated = true;
            this.#worker.terminate();
        }
    }
}

function wait(delay) {
    return new Promise(res => {
        setTimeout(res, delay);
    });
}
import { Cell } from "../core/mechanics";

const EVENTS = ["none", "garbage_to_board"] as const;
type Event = typeof EVENTS[number];
type Params = {
    "none": [],
    "garbage_to_board": [number]
};

export class EventEmitter {

    listeners: {[E in Event]: ((...args: Params[E]) => any)[]};

    constructor() {
        //@ts-ignore
        this.listeners = {};
        EVENTS.forEach(event => {
            this.listeners[event] = [];
        });
    }

    addListener<E extends Event>(event: E, listener: (...args: Params[E]) => any) {
        this.listeners[event].push(listener);
    }

    emit<E extends Event>(event: E, ...params: Params[E]) {
        for(const listener of this.listeners[event]) listener(...params);
    }
}
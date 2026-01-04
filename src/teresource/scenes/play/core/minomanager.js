// @ts-check
import { MINO_DATA_INDEX } from "./coredata";
import { Mino } from './mechanics';
import { shuffle } from "#util";

/** States of the mino currently handled by the player */
export class CurrentMinoManager {
    /** @type {Mino} */
    #currentMino = new Mino("z");
    /** x of the center of the mino shape @type number */
    row = 0;
    /** y of the center of the mino shape @type number */
    column = 0;
    /** @type boolean */
    #isPlaced = true;

    constructor() {
    }

    get mino() {
        return this.#currentMino;
    }

    /** Rotate mino in degree @param {number} rotation degree */
    rotateMino(rotation) {
        this.#currentMino = this.#currentMino.copyRotated(rotation);
    }

    /** Set the status 'isPlaced' true */
    place() {
        this.#isPlaced = true;
    }

    /** Receive a new mino and reset status withit
     *  @param {Mino} mino */
    startNextMino(mino) {
        this.#isPlaced = false;
        this.#currentMino = mino;
        this.row = 20;
        this.column = 4;
    }

    get isPlaced() {
        return this.#isPlaced;
    };

    /** Copy public and private members and returns it @return {CurrentMinoManager} */
    duplicate() {
        const copied = new CurrentMinoManager();
        copied.row = this.row;
        copied.column = this.column;
        copied.#currentMino = this.#currentMino;
        copied.#isPlaced = this.#isPlaced;
        return copied;
    }
}

/** @typedef {{minoTypeToUseList:string[]}} BagConfig */

export class Bag {
    static TYPES = {
        SEVEN: 0
    }
    /** @type {number} */
    type;
    /** @type {BagConfig} */ config;
    /** @param {number} type @param {BagConfig} config*/
    constructor(type, config) {
        this.type = type;
        this.config = config;
    }

    /** @return {Mino[]} */
    create_allMinoTypeShuffled() {
        const minoTypeArr = this.config.minoTypeToUseList;
        return shuffle(minoTypeArr.map((minoType) => new Mino(minoType)));
    }

    /**
     * @param {Mino[]} minoQueue
     */
    createAndPushTo(minoQueue) {
        const queueToAdd = this.create_allMinoTypeShuffled();
        minoQueue.push(...queueToAdd);
    }
}

export class MinoQueueManager {
    minoQueue
    bag

    /** @param {Bag} bag
     *  @param {Mino[]} minoQueue
    */
    constructor(bag, minoQueue = []) {
        this.bag = bag;
        this.minoQueue = minoQueue;
        this.#genMinoQueueUntil100();
    }

    takeNextMino() {
        this.#genMinoQueueUntil100();
        const mino = this.minoQueue.splice(0, 1)[0];
        return mino;
    }

    #genMinoQueueUntil100() {
        while (this.minoQueue.length < 100) this.bag.createAndPushTo(this.minoQueue);
    }
}
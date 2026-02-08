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
    /** @type {number} */
    #spawnColumn;
    #spawnRow;
    /** @type boolean */
    #isPlaced = true;

    /** @param {number} spawnRow @param {number} spawnColumn */
    constructor(spawnRow, spawnColumn) {
        this.#spawnColumn = spawnColumn;
        this.#spawnRow = spawnRow;
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
        this.row = this.#spawnRow;
        this.column = this.#spawnColumn;
    }

    get isPlaced() {
        return this.#isPlaced;
    };

    /** Copy public and private members and returns it @return {CurrentMinoManager} */
    duplicate() {
        const copied = new CurrentMinoManager(this.#spawnRow, this.#spawnColumn);
        copied.row = this.row;
        copied.column = this.column;
        copied.#currentMino = this.#currentMino;
        copied.#isPlaced = this.#isPlaced;
        return copied;
    }
}


/** Manage held mino in the game */
export class HeldMinoManager {
    /**  @type {Mino|undefined} */ #mino
    /** @type {boolean} */ #recieved = false;

    constructor() {
    }

    //Edit mino to make it in right condition as a held mino
    #arrangeMinoState() {
        if(!this.#mino) return;
        this.#mino = this.#mino.copyRotated(-this.#mino.rotation);
    }

    resetLimit() {
        this.#recieved = false;
    }

    canRecieveMino() {
        return !this.#recieved;
    }

    /** @param {Mino} mino */
    recieveMino(mino) {
        if(!this.canRecieveMino()) throw "HeldMinoManager can't recieve mino yet";
        const minoToReturn = this.#mino;
        this.#mino = mino;
        this.#arrangeMinoState();
        this.#recieved = true;
        return minoToReturn;
    }

    /** @return {Mino|undefined} */
    getMino() {
        return this.#mino;
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
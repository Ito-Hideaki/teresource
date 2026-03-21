import { GameViewContext } from "../infra/context";

class ScheduledDamageObject extends Phaser.GameObjects.NineSlice {
    scheduledDamage
    /** @param { Phaser.Scene } scene @param { import("../core/garbage").ScheduledDamage } scheduledDamage */
    constructor(scene, scheduledDamage) {
        super(scene, 0, 0, "scheduled_damage_cell", "arriving", 12, 12, 4, 4, 4, 4);
        this.scheduledDamage = scheduledDamage;
        this.setOrigin(1, 1);
    }
}

export class ScheduledDamageView {
    #state
    #stats
    #cellWidth
    #objectX
    #objectY
    #reportStack
    #scene
    #boardContainer

    /** @type {ScheduledDamageObject[]} */ #objects

    /** @param { Phaser.Scene } scene @param { GameViewContext } gvContext */
    constructor(scene, gvContext) {
        this.#scene = scene;
        this.#boardContainer = gvContext.boardContainer;
        this.#state = gvContext.gameHighContext.scheduledDamageState;
        this.#stats = gvContext.gameHighContext.gameStats;
        this.#reportStack = gvContext.gameContext.gameReportStack;
        this.#cellWidth = gvContext.getBoardCellWidth();
        this.#objects = [];
        this.#objectX = gvContext.getRelativeBoardX(0) - 20;
        this.#objectY = gvContext.getRelativeBoardY(gvContext.gameContext.boardSize.rowCount);
    }

    update() {
        //add new objects
        this.#reportStack.recieveScheduledDamage.forEach(report => {
            const object = new ScheduledDamageObject(this.#scene, report.scheduledDamage);
            this.#scene.add.existing(object);
            this.#boardContainer.add(object);
            this.#objects.push(object);
            console.log(this.#objects);
        });

        //remove objects with deleted scheduled damage
        while(this.#objects[0] && this.#objects[0].scheduledDamage !== this.#state.damageStack[0]) {
            this.#objects.splice(0, 1)[0].destroy();
        }

        //render
        const cellHeight = this.#cellWidth;
        let y = this.#objectY;
        for(const object of this.#objects) {
            object.setFrame(object.scheduledDamage.arrived ? "arrived" : "arriving");
            object.x = this.#objectX;
            object.y = y;
            const height = cellHeight * object.scheduledDamage.length;
            //object.width = 15;
            object.width = 20;
            object.height = height;
            y -= height;
        }
    }
}
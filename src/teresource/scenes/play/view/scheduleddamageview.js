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
    #cellWidth
    #objectX
    #objectY
    /** @type {ScheduledDamageObject[]} */ #objects

    /** @param { Phaser.Scene } scene @param { GameViewContext } gvContext */
    constructor(scene, gvContext) {
        this.#state = gvContext.gameHighContext.scheduledDamageState;
        this.#cellWidth = gvContext.getBoardCellWidth();
        this.#objects = [];
        this.#objectX = gvContext.getRelativeBoardX(0) - 20;
        this.#objectY = gvContext.getRelativeBoardY(gvContext.gameContext.boardSize.rowCount);

{        const object = scene.add.existing(new ScheduledDamageObject(scene, { length: 10 }));
        gvContext.boardContainer.add(object);
        this.#objects.push(object);}
{        const object = scene.add.existing(new ScheduledDamageObject(scene, { length: 4 }));
        gvContext.boardContainer.add(object);
        this.#objects.push(object);}
    }

    update() {
        const cellHeight = this.#cellWidth;
        let y = this.#objectY;
        for(const object of this.#objects) {
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
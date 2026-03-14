import Phaser from "phaser";

type Item = {
    name: string;
    /** If the item has child items */ children?: Item[];
    /** If the item belongs to another item as one of its children */ parent?: Item;
    /** If the item has an actual gameobject in the scene */ view?: Phaser.GameObjects.Text;
}

class ItemText extends Phaser.GameObjects.Text {
    constructor(scene: Phaser.Scene, x: number, y: number, item: Item) {
        super(scene, x, y, item.name, { color: "black", fontSize: 50, fontFamily: "sans-serif" });
        this.setOrigin(0, 0.5);
    }
}

export function createMenuTexture(scene: Phaser.Scene) {
    { //cursor
        const h = 30, w = 30;
        const graphics = scene.add.graphics();
        graphics.fillStyle(0x000000);
        graphics.fillTriangle(
            0, 0,
            0, h,
            w, h/2
        );
        graphics.generateTexture("menu_cursor", w, h);
    }
}

const TEXT_LEFT = 300;

export class MenuScene extends Phaser.Scene {

    ITEM_TREE: Item[] = [];
    // @ts-ignore
    selectedItem: Item;
    // @ts-ignore
    cursor: Phaser.GameObjects.Image;

    constructor() {
        super('menu');
    }

    preload() {
    }

    create() {
        const scene = this;

        scene.add.text(TEXT_LEFT, 80, "Teresource", { color: "black", fontSize: 80, fontFamily: "sans-serif" });

        const item: Item = { name: "Play Demo" };
        const text = new ItemText(scene, TEXT_LEFT, 300, item);
        item.view = text;
        scene.add.existing(text);
        scene.ITEM_TREE.push(item);

        this.cursor = scene.add.image(0, 0, "menu_cursor");

        this.selectedItem = item;

        //@ts-ignore
        scene.input.keyboard.on("keydown", (e: KeyboardEvent) => {
            // @ts-ignore
            if (!this.game.inputEnabled) return;
            e.preventDefault();
            if (e.repeat) return;

            if(e.code === "KeyZ") {
                scene.scene.start("play");
            }
        })
    }

    update() {
        //cursor view
        if(this.selectedItem.view) {
            this.cursor.setVisible(true);
            this.cursor.setPosition(this.selectedItem.view.x - 50, this.selectedItem.view.y);
        } else {
            this.cursor.setVisible(false);
        }
    }
}
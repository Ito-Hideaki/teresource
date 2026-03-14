import Phaser from "phaser";

type Item = {
    name: string;
    /** If the item has child items */ children?: Item[];
    /** If the item has an actual gameobject in the scene */ view?: Phaser.GameObjects.Text;
    onEnter?: Function;
}

class ItemText extends Phaser.GameObjects.Text {
    constructor(scene: Phaser.Scene, x: number, y: number, item: Item) {
        super(scene, x, y, item.name, { color: "black", fontSize: 50, fontFamily: "sans-serif" });
        this.setOrigin(0, 0.5);
    }
}

class ItemMenu {
    tree: Item[];
    selectedItems: Item[];

    constructor(tree: Item[]) {
        this.tree = tree;
        this.selectedItems = [ tree[0] ];
    }

    getCurrent() {
        const current = this.selectedItems.at(-1);
        if(!current) throw "no current selected";
        return current;
    }

    getParentArray() {
        const parentItem = this.selectedItems.at(-2);
        return parentItem?.children ? parentItem.children : this.tree;
    }

    moveToIndex(index: number) {
        this.selectedItems[this.selectedItems.length - 1] = this.getParentArray()[index];
    }

    moveByAmount(amount: number) {
        const current = this.getCurrent();
        const parentArray =  this.getParentArray();
        const index = parentArray.indexOf(current);
        if(index === -1) throw "wtf";
        const movedIndex = (index + amount + parentArray.length ) % parentArray.length;
        this.moveToIndex(movedIndex);
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
            w, h / 2
        );
        graphics.generateTexture("menu_cursor", w, h);
    }
}

const TEXT_LEFT = 200;

export class MenuScene extends Phaser.Scene {

    //@ts-ignore
    menu: ItemMenu;
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

        this.menu = new ItemMenu([
            { name: "Play Demo", onEnter: () => { scene.scene.start("play"); } },
            { name: "Settings" },
        ]);

        scene.menu.tree.forEach((item, i) => {
            const y = 300 + 80 * i;
            const text = new ItemText(scene, TEXT_LEFT, y, item);
            item.view = text;
            scene.add.existing(text);
        });

        this.cursor = scene.add.image(0, 0, "menu_cursor");

        //@ts-ignore
        scene.input.keyboard.on("keydown", (e: KeyboardEvent) => {
            // @ts-ignore
            if (!this.game.inputEnabled) return;
            e.preventDefault();

            if (e.code === "KeyZ") {
                const current = scene.menu.getCurrent();
                if(current.onEnter) current.onEnter();
            }

            if(e.code === "ArrowDown") {
                scene.menu.moveByAmount(1);
            }

            if(e.code === "ArrowUp") {
                scene.menu.moveByAmount(-1);
            }
        })
    }

    update() {
        //cursor view
        const selectedItem = this.menu.selectedItems.at(-1);
        if (selectedItem && selectedItem.view) {
            this.cursor.setVisible(true);
            this.cursor.setPosition(selectedItem.view.x - 50, selectedItem.view.y);
        } else {
            this.cursor.setVisible(false);
        }
    }
}
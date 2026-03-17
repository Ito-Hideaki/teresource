import Phaser from "phaser";
import { createAndAddSettingsPanel } from "./menu/settingspanel";
import { GameConfig } from "./play/controller/game";
import { KeyBindingConfig } from "./play/controller/controlorder";

const TEXT_LEFT = 100;

type Item = {
    name: string;
    /** If the item has child items */ children?: Item[];
    /** If the item has an actual gameobject in the scene */ view?: Phaser.GameObjects.Text;
    onEnter?: string;
    onEscape?: string;
}

class ItemText extends Phaser.GameObjects.Text {
    constructor(scene: Phaser.Scene, x: number, y: number, item: Item) {
        super(scene, x, y, item.name, { color: "black", fontSize: 40, fontFamily: "sans-serif" });
        this.setOrigin(0, 0.5);
    }
}

class ItemMenu {
    tree
    path: Item[]
    /** When false it means parent Item has no children */
    current: Item | false

    constructor(tree: Item[]) {
        this.tree = tree;
        this.path = [];
        this.current = tree[0];
    }

    /** Return false when there's no current */
    getParentArray() {
        if (!this.current) return false;

        const parentItem = this.path.at(-1);
        return parentItem ? (parentItem.children ?? false) : this.tree;
    }

    moveByAmount(amount: number) {
        const parentArray = this.getParentArray();
        if (!parentArray || !this.current) return;

        const index = parentArray.indexOf(this.current);
        if (index === -1) throw "wtf";
        const movedIndex = (index + amount + parentArray.length) % parentArray.length;
        this.current = parentArray[movedIndex];
    }

    enter() {
        if (this.current) {
            this.path.push(this.current);
            if (this.current.children) {
                this.current = this.current.children[0];
            } else {
                this.current = false;
            }
            return true;
        }
        return false;
    }

    escape() {
        if (this.path.length) {
            const escapedItem = this.path.splice(this.path.length - 1, 1)[0];
            this.current = escapedItem;
            return true;
        }
        return false;
    }
}

class MenuObject {

    menu
    cursor
    /** EVENTS: "playdemo", "opensettings", "closesettings" */
    ee

    constructor(scene: Phaser.Scene) {
        this.ee = new Phaser.Events.EventEmitter();

        scene.add.text(TEXT_LEFT, 160, "Z ... 決定 | X ... 戻る", { color: "#666", fontSize: 30, fontFamily: "sans-serif" });

        this.menu = new ItemMenu([
            { name: "Play Demo", onEnter: "playdemo" },
            { name: "Settings", onEnter: "opensettings", onEscape: "closesettings" },
        ]);
        this.menu.tree.forEach((item, i) => {
            const y = 220 + 60 * i;
            const text = new ItemText(scene, TEXT_LEFT, y, item);
            item.view = text;
            scene.add.existing(text);
        });

        this.cursor = scene.add.image(0, 0, "menu_cursor");
    }

    update() {
        //cursor view
        const current = this.menu.current;
        if (current && current.view) {
            this.cursor.setVisible(true);
            this.cursor.setPosition(current.view.x - 50, current.view.y);
        } else {
            this.cursor.setVisible(false);
        }

        //item view
        const parentArray = this.menu.getParentArray();
        function updateViewUnderItemList(items: Item[]) {
            items.forEach(item => {
                if (item.view) {
                    if (parentArray === items) { //show item views
                        item.view.setVisible(true);
                    } else { //hide item views
                        item.view.setVisible(false);
                    }
                }

                if (item.children) {
                    updateViewUnderItemList(item.children);
                }
            });
        }
        updateViewUnderItemList(this.menu.tree);
    }

    userEnter() {
        const current = this.menu.current;
        const didEnter = this.menu.enter();
        if (current && didEnter) {
            if (current.onEnter) {
                this.ee.emit(current.onEnter);
            }
        }
    }

    userEscape() {
        const didEscape = this.menu.escape();
        const current = this.menu.current;
        if (current && didEscape) {
            if (current.onEscape) {
                this.ee.emit(current.onEscape);
            }
        }
    }

    userUp() {
        this.menu.moveByAmount(-1);
    }

    userDown() {
        this.menu.moveByAmount(1);
    }
}

export function createMenuTexture(scene: Phaser.Scene) {
    { //cursor
        const h = 30, w = 30;
        const graphics = scene.add.graphics();
        const triShape = new Phaser.Geom.Triangle(
            0, 0,
            0, h,
            w, h / 2
        );
        //black color frame
        graphics.fillStyle(0x000000);
        graphics.fillTriangleShape(triShape);
        //red color frame
        graphics.translateCanvas(w, 0);
        graphics.fillStyle(0xff0000);
        graphics.fillTriangleShape(triShape);

        graphics.generateTexture("menu_cursor", w*2, h);
        const texture = scene.textures.get("menu_cursor");
        texture.add("black", 0, 0, 0, w, h);
        texture.add("red",   0, w, 0, w, h);
    }
}

export class MenuScene extends Phaser.Scene {

    //@ts-ignore
    menuObj: MenuObject

    constructor() {
        super('menu');
    }

    preload() {
    }

    create() {
        const scene = this;

        scene.add.text(TEXT_LEFT, 50, "Teresource", { color: "black", fontSize: 70, fontFamily: "sans-serif" });

        this.menuObj = new MenuObject(scene);

        const { setVisible: setSettingsVisible, configUIDataHandlerMap } = createAndAddSettingsPanel();
        setSettingsVisible(false);

        //@ts-ignore
        scene.input.keyboard.on("keydown", (e: KeyboardEvent) => {
            // @ts-ignore
            if (!this.game.inputEnabled) return;
            e.preventDefault();

            if (e.code === "KeyZ") scene.menuObj.userEnter();

            if (e.code === "KeyX") scene.menuObj.userEscape();

            if (e.code === "ArrowDown") scene.menuObj.userDown();

            if (e.code === "ArrowUp") scene.menuObj.userUp();
        })

        scene.menuObj.ee.on("playdemo", () => {
            const keyBindingConfig: KeyBindingConfig = configUIDataHandlerMap.keyBinding.getConfig() as KeyBindingConfig;
            scene.scene.start("play", { keyBindingConfig });
        });

        scene.menuObj.ee.on("opensettings", () => {
            setSettingsVisible(true);
        });

        scene.menuObj.ee.on("closesettings", () => {
            setSettingsVisible(false);
        })
    }

    update() {
        this.menuObj.update();
    }
}
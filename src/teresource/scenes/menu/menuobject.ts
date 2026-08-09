import { PlayerKeyboardControlConfig, PlaySceneData } from "../play";
import { TEXT_LEFT } from "./design";
import { TYPICAL_GAME_CONFIG } from "../play/controller/game";
import { GameSession } from "../play/controller/gamesession";

type PlayItemCommand = {
    type: "play";
    createData: (keyboardControlConfig: PlayerKeyboardControlConfig) => PlaySceneData;
}

type CustomPlayItemCommand = {
    type: "custom_play";
}

type PanelItemCommand = {
    type: "panel";
    panel: "customgametab" | "settings" | "credits";
    open: boolean;
}

export type ItemCommand = PlayItemCommand | CustomPlayItemCommand | PanelItemCommand;

type Item = {
    name: string;
    /** If the item has child items */ children?: Item[];
    /** If the item has an actual gameobject in the scene */ view?: Phaser.GameObjects.Text;
    onEnter?: ItemCommand;
    onEscape?: ItemCommand;
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

export class MenuObject {

    menu
    cursor
    /** EVENTS: "itemcommand" */
    ee

    constructor(scene: Phaser.Scene) {
        this.ee = new Phaser.Events.EventEmitter();

        scene.add.text(TEXT_LEFT, 160, "Z ... 決定 | X ... 戻る", { color: "#666", fontSize: 30, fontFamily: "sans-serif" });

        this.menu = new ItemMenu([
            {
                name: "Play Demo", children: [
                    { name: "40LINE", onEnter: {
                        type: "play",
                        createData: (keyboardControlConfig: PlayerKeyboardControlConfig) => {
                            return ({
                                matchConfig: {
                                    players: [{
                                        control: keyboardControlConfig,
                                        game: TYPICAL_GAME_CONFIG
                                    }],
                                    session: { type: GameSession.SessionType.Line, targetLines: 40, timeLimit: 0 },
                                    sendAttackToMyself: false,
                                    sendAttackToOthers: false
                                }
                            });
                        }
                    }},
                    { name: "BACKFIRE", onEnter: {
                        type: "play",
                        createData: (keyboardControlConfig: PlayerKeyboardControlConfig) => {
                            return {
                                matchConfig: {
                                    players: [{
                                        control: keyboardControlConfig,
                                        game: TYPICAL_GAME_CONFIG
                                    }],
                                    session: { type: GameSession.SessionType.None, targetLines: 0, timeLimit: 0 },
                                    sendAttackToMyself: true,
                                    sendAttackToOthers: false
                                }
                            };
                        }
                    }},
                    { name: "2P", onEnter: {
                        type: "play",
                        createData: (keyboardControlConfig: PlayerKeyboardControlConfig) => {
                            return {
                                matchConfig: {
                                    players: [{
                                        control: keyboardControlConfig,
                                        game: TYPICAL_GAME_CONFIG
                                    }, {
                                        control: keyboardControlConfig,
                                        game: TYPICAL_GAME_CONFIG
                                    }],
                                    session: { type: GameSession.SessionType.None, targetLines: 0, timeLimit: 0 },
                                    sendAttackToMyself: false,
                                    sendAttackToOthers: true
                                }
                            };
                        }
                    }},
                    { name: "BOT", onEnter: {
                        type: "play",
                        createData: (keyboardControlConfig: PlayerKeyboardControlConfig) => {
                            return {
                                matchConfig: {
                                    players: [{
                                        control: keyboardControlConfig,
                                        game: TYPICAL_GAME_CONFIG
                                    }, {
                                        control: { type: "bot", botConfig: { type: "test1", interval: 1 } },
                                        game: TYPICAL_GAME_CONFIG
                                    }],
                                    session: { type: GameSession.SessionType.None, targetLines: 0, timeLimit: 0 },
                                    sendAttackToMyself: false,
                                    sendAttackToOthers: true
                                }
                            };
                        }
                    }},
                    { name: "BOT (INVINCIBLE)", onEnter: {
                        type: "play",
                        createData: (keyboardControlConfig: PlayerKeyboardControlConfig) => {
                            return {
                                matchConfig: {
                                    players: [{
                                        control: keyboardControlConfig,
                                        game: TYPICAL_GAME_CONFIG
                                    }, {
                                        control: { type: "bot", botConfig: { type: "test2", interval: 1 } },
                                        game: TYPICAL_GAME_CONFIG
                                    }],
                                    session: { type: GameSession.SessionType.None, targetLines: 0, timeLimit: 0 },
                                    sendAttackToMyself: false,
                                    sendAttackToOthers: true
                                }
                            };
                        }
                    }},
                ]
            },
            {
                name: "Custom Game", onEnter: { type: "panel", open: true, panel: "customgametab" }, onEscape: { type: "panel", open: false, panel: "customgametab" }, children: [
                    { name: "Play", onEnter: { type: "custom_play" } },
                ]
            },
            { name: "Settings", onEnter: { type: "panel", open: true, panel: "settings" }, onEscape: { type: "panel", open: false, panel: "settings" } },
            { name: "Credits", onEnter: { type: "panel", open: true, panel: "credits" }, onEscape: { type: "panel", open: false, panel: "credits" } }
        ]);

        function createViewUnderItem(item: Item, i: number) {
            const y = 220 + 60 * i;
            const text = new ItemText(scene, TEXT_LEFT, y, item);
            item.view = text;
            scene.add.existing(text);

            if (item.children) item.children.forEach(createViewUnderItem);
        }
        this.menu.tree.forEach(createViewUnderItem);

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
        if(didEnter && current && current.onEnter) this.ee.emit("itemcommand", current.onEnter);
    }

    userEscape() {
        const didEscape = this.menu.escape();
        const current = this.menu.current;
        if (didEscape && current && current.onEscape) this.ee.emit("itemcommand", current.onEscape);
    }

    userUp() {
        this.menu.moveByAmount(-1);
    }

    userDown() {
        this.menu.moveByAmount(1);
    }
}
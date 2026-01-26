# Teresource Architecture

This document describes the architecture of Teresource—a Tetris-like game built on Phaser 3.

---

## Table of Contents

1. [Layer Structure](#layer-structure)
2. [Dependency Graph](#dependency-graph)
3. [Data Flow](#data-flow)
4. [Phaser Integration](#phaser-integration)
5. [Design Patterns](#design-patterns)
6. [State Ownership](#state-ownership)
7. [Coordinate Systems](#coordinate-systems)
8. [Extension Guide](#extension-guide)

---

## Layer Structure

The codebase follows a **4-layer architecture** with strict dependency rules:

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Entry Point                               │
│  teresource.js — Phaser Game init, DOM setup, focus handling        │
└──────────────────────────────┬──────────────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          Scenes Layer                               │
│  bootloader.js — Asset loading          play.js — Main gameplay     │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        ▼                      ▼                      ▼
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│  Controller  │       │     Core     │       │     View     │
│    Layer     │       │    Layer     │       │    Layer     │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ Orchestrates │       │ Pure game    │       │ Renders game │
│ game flow,   │──────►│ logic, no    │◄──────│ state using  │
│ input/time   │       │ Phaser deps  │       │ Phaser       │
└──────────────┘       └──────────────┘       └──────────────┘
                               ▲
                               │
┌─────────────────────────────────────────────────────────────────────┐
│                      Infrastructure Layer                           │
│  context.js — Dependency containers    gamefactory.js — Wiring      │
└─────────────────────────────────────────────────────────────────────┘
```

### Layer Summary

| Layer          | Path                      | Phaser Dependency |
|----------------|---------------------------|-------------------|
| **Core**       | `scenes/play/core/`       | ❌ None           |
| **Controller** | `scenes/play/controller/` | ❌ None           |
| **View**       | `scenes/play/view/`       | ✅ Full           |
| **Infra**      | `scenes/play/infra/`      | ⚠️ Minimal        |

### Import Rules

- **Core** → May only import from Core
- **Controller** → May import from Core
- **View** → May import from Core (read-only) and Infra
- **Infra** → May import from Core, Controller, and View (for factory wiring)
- **Scenes** → May import from all layers

---

## Dependency Graph

### File-Level Dependencies

```
play.js
├── gamefactory.js
│   ├── context.js
│   ├── gamecontroller.js
│   │   ├── boardcontroller.js
│   │   │   ├── mechanics.js
│   │   │   ├── minomanager.js
│   │   │   └── rotationsystem.js
│   │   └── report.js
│   └── gameviewcontroller.js
│       ├── boardview.js
│       │   ├── cellimage.js
│       │   └── viewmechanics.js
│       ├── boarddeco.js
│       ├── subminoview.js
│       └── gameeffectview.js
├── mechanics.js (direct read for spawn)
└── coredata.js (MinoTypes lookup)
```

### Key Classes by Layer

#### Core Layer (`scenes/play/core/`)

| Class               | File              | Responsibility                                     |
|---------------------|-------------------|----------------------------------------------------|
| `Mino`              | mechanics.js      | Tetromino piece: type, rotation, shape             |
| `Cell`              | mechanics.js      | Single cell: `isEmpty`, `blockColor`, `clear()`    |
| `Board`             | mechanics.js      | Generic 2D grid with collision detection           |
| `CellBoard`         | mechanics.js      | 40×10 game board with mino placement               |
| `CurrentMinoManager`| minomanager.js    | Active piece state: position, rotation             |
| `MinoQueueManager`  | minomanager.js    | Next-piece queue with 7-bag randomizer             |
| `HeldMinoManager`   | minomanager.js    | Hold piece with once-per-piece usage limit         |
| `RotationSystem`    | rotationsystem.js | Wall-kick tables (SRS-style)                       |
| `LineClearManager`  | lineclear.js      | Detects and clears full lines                      |
| `MinoTypes`         | coredata.js       | Static shape data for all 7 tetromino types        |

#### Controller Layer (`scenes/play/controller/`)

| Class                   | File               | Responsibility                              |
|-------------------------|--------------------|---------------------------------------------|
| `GameController`        | gamecontroller.js  | High-level loop: spawn, hold, line-clear    |
| `BoardUpdater`          | boardcontroller.js | Applies frame updates: gravity, lock-down   |
| `BoardUpdateCalculator` | boardcontroller.js | Pure function: computes state diff          |
| `ControlOrderProvider`  | boardcontroller.js | Input → ControlOrder with DAS/ARR timing    |
| `ControlOrder`          | boardcontroller.js | Bitmask flags for player input              |
| `BoardUpdateState`      | boardcontroller.js | Persistent state: `fallingProgress`, etc.   |
| `GameReportStack`       | report.js          | Event bus for controller→view communication |

#### View Layer (`scenes/play/view/`)

| Class                  | File                  | Responsibility                         |
|------------------------|-----------------------|----------------------------------------|
| `GameViewController`   | gameviewcontroller.js | Coordinates all view components        |
| `BoardView`            | boardview.js          | Renders 40×10 grid with CellImage      |
| `BoardDeco`            | boarddeco.js          | Static decorations: background, grid   |
| `MinoQueueView`        | subminoview.js        | Next-piece preview                     |
| `HeldMinoView`         | subminoview.js        | Hold piece display                     |
| `GameEffectManagerView`| gameeffectview.js     | Line-clear animations, popup text      |
| `CellImage`            | cellimage.js          | Single cell sprite                     |
| `CellSheetParent`      | customtexture.js      | Manages cell skin textures             |

#### Infrastructure Layer (`scenes/play/infra/`)

| Class            | File           | Responsibility                                  |
|------------------|----------------|-------------------------------------------------|
| `GameContext`    | context.js     | Container: cellBoard, minoManagers, etc.        |
| `GameViewContext`| context.js     | Container: view objects + GameContext reference |
| `GameFactory`    | gamefactory.js | Factory + DI: creates and wires all objects     |

---

## Data Flow

### Input → State Update

```
Phaser Keyboard Event
        │
        ▼
PlayScene.input.keyboard.on("keydown" / "keyup")
        │  maps keyCode → ControlOrder flag
        ▼
ControlOrderProvider.setNewPlayerInput(flag)
        │  manages DAS/ARR timing
        ▼
ControlOrderProvider.provideControlOrder()
        │  returns ControlOrder bitmask
        ▼
GameController.update(deltaTime)
        │  checks spawn/hold
        ▼
BoardUpdater.update(controlOrder, deltaTime)
        │
        ▼
BoardUpdateCalculator.calculate(...)
        │  PURE: computes BoardUpdateDiff
        ▼
BoardUpdater applies diff
        │  - currentMinoManager.move/rotate
        │  - if placed: cellBoard.placeMino()
        ▼
ControlOrderProvider.receiveControlResult(diff)
        │  resets ARR cooldown on success
        ▼
(ready for next frame)
```

### State → View Update

```
GameController.update() — Event Collection
        │
        ├─► LineClearManager detects lines
        │         ▼
        │   GameReportStack.add(LineClearReport)
        │
        └─► BoardUpdater places piece
                  ▼
            GameReportStack.add(MinoSpawnReport)

        ▼

GameViewController.update() — Rendering
        │
        ├─► BoardView.update()
        │         │  reads cellBoard.compositeWithMino()
        │         ▼
        │   Updates each CellImage sprite
        │
        ├─► MinoQueueView.update()
        │         │  reads MinoQueueManager.peekNext()
        │         ▼
        │   Renders next-piece previews
        │
        ├─► HeldMinoView.update()
        │         │  reads HeldMinoManager.heldMino
        │         ▼
        │   Renders hold piece
        │
        └─► GameEffectManagerView.update()
                  │  consumes GameReportStack.lineClear[]
                  ▼
            Creates line-clear effects

        ▼

GameReportStack.renewAll()
        │  empties stack
        ▼
(ready for next frame)
```

---

## Phaser Integration

### Scene Lifecycle

| Phaser Method | Teresource Usage                                              |
|---------------|---------------------------------------------------------------|
| `preload()`   | BootLoader loads all assets (images, JSON) with progress bar  |
| `create()`    | PlayScene calls `GameFactory.create()` to wire all objects    |
| `update(dt)`  | PlayScene calls `GameController.update()` then `GameViewController.update()` |

### Phaser Objects Used

| Phaser Class                   | Usage                                    |
|--------------------------------|------------------------------------------|
| `Phaser.Game`                  | Entry point in `teresource.js`           |
| `Phaser.Scene`                 | Extended by `BootLoader` and `PlayScene` |
| `Phaser.GameObjects.Container` | Groups board sprites                     |
| `Phaser.GameObjects.Sprite`    | Subclassed as `CellImage` for cells      |
| `Phaser.GameObjects.Graphics`  | Line-clear flash effects                 |
| `Phaser.GameObjects.Text`      | Score popups, debug text                 |
| `Phaser.Input.Keyboard`        | Key event handling                       |
| `Phaser.Loader`                | Asset loading                            |

### Key Mappings

- Arrow keys → `MOVE_LEFT`, `MOVE_RIGHT`, `START_SOFT_DROP`/`STOP_SOFT_DROP`
- Space → `HARD_DROP`
- Z/X → `ROTATE_COUNTER_CLOCK`, `ROTATE_CLOCK_WISE`
- C or Shift → `HOLD`

---

## Design Patterns

### 1. Factory + Dependency Injection

`GameFactory` centralizes object creation:

```javascript
class GameFactory {
    create(scene, config) {
        const cellBoard = new CellBoard(...);
        const rotationSystem = new RotationSystem_Standard();
        // ... create all objects ...

        const gameContext = new GameContext({ cellBoard, ... });
        const gameController = new GameController(gameContext, ...);

        return { gameContext, gameController, gameViewController };
    }
}
```

### 2. Context Object Pattern

Related dependencies are bundled into context objects:

```javascript
class GameContext {
    constructor(source) {
        this.cellBoard = source.cellBoard;
        this.currentMinoManager = source.currentMinoManager;
        this.minoQueueManager = source.minoQueueManager;
        // ...
    }
}
```

### 3. Calculator Pattern (Pure Functions)

`BoardUpdateCalculator` computes diffs without side effects:

```javascript
class BoardUpdateCalculator {
    calculate(context, controlOrder, state, deltaTime) {
        const diff = new BoardUpdateDiff();
        // Pure calculations—no mutations
        return diff;  // Caller applies this diff
    }
}
```

### 4. Event Bus (GameReportStack)

Decouples controller from view:

```javascript
// Controller adds events
gameReportStack.add(new LineClearReport({ rowToClearList: [38, 39] }));

// View consumes events
for (const report of gameReportStack.lineClear) {
    this.createLineClearEffect(report);
}
gameReportStack.renewAll();  // Clear after consumption
```

### 5. Bitmask Flags

`ControlOrder` uses bitwise operations:

```javascript
class ControlOrder {
    static MOVE_LEFT            = 0x0001;
    static MOVE_RIGHT           = 0x0002;
    static START_SOFT_DROP      = 0x0004;
    static HARD_DROP            = 0x0010;
    static ROTATE_CLOCK_WISE    = 0x0020;
    static ROTATE_COUNTER_CLOCK = 0x0040;
    static HOLD                 = 0x0100;
    // ...
}
```

---

## State Ownership

| State                 | Owner Class           | Mutated By       | Read By          |
|-----------------------|-----------------------|------------------|------------------|
| Board cells (40×10)   | `CellBoard`           | `BoardUpdater`   | `BoardView`      |
| Active piece position | `CurrentMinoManager`  | `BoardUpdater`   | `BoardView`      |
| Piece queue           | `MinoQueueManager`    | `GameController` | `MinoQueueView`  |
| Held piece            | `HeldMinoManager`     | `GameController` | `HeldMinoView`   |
| Falling progress      | `BoardUpdateState`    | `BoardUpdater`   | (internal)       |
| DAS/ARR timers        | `ControlOrderProvider`| (self)           | (internal)       |
| Event reports         | `GameReportStack`     | Controllers      | Views            |

### Mutation Rules

1. **Core objects** are mutated only by Controller layer
2. **View objects** never mutate Core—they only read via `GameContext`
3. **`BoardUpdateCalculator`** never mutates anything—it returns diffs
4. **`GameReportStack`** is the only cross-layer mutable channel

---

## Coordinate Systems

| System    | Origin   | X Direction | Y Direction | Unit  |
|-----------|----------|-------------|-------------|-------|
| `cellPos` | Top-left | Right (+)   | Down (+)    | Cells |
| `viewPos` | Top-left | Right (+)   | Down (+)    | Pixels|

Board layout (40 rows × 10 columns):

```
     Column:  0   1   2   3   4   5   6   7   8   9
            ┌───┬───┬───┬───┬───┬───┬───┬───┬───┬───┐
  Row 0     │   │   │   │   │   │   │   │   │   │   │  ← Hidden
    ...     │           (spawn area)                │
  Row 19    │   │   │   │   │   │   │   │   │   │   │
            ├───┼───┼───┼───┼───┼───┼───┼───┼───┼───┤
  Row 20    │   │   │   │   │   │   │   │   │   │   │  ← Visible
    ...     │           (play area)                 │
  Row 39    │███│███│   │   │███│███│███│███│   │   │
            └───┴───┴───┴───┴───┴───┴───┴───┴───┴───┘
```

---

## Extension Guide

### Adding a New Rotation System

1. **Create a subclass** of `RotationSystem` in `rotationsystem.js`:

```javascript
export class RotationSystem_Custom extends RotationSystem {
    constructor() {
        super();
    }

    /** @param {string} minoType @return {RotationPack} */
    distributeRotationPack(minoType) {
        // Return appropriate RotationPack based on mino type
        switch(minoType) {
            case "i":
                return myIPack;
            default:
                return myDefaultPack;
        }
    }
}
```

2. **Define kick tables** using `RotationPack`:

```javascript
const myDefaultPack = new RotationPack({
    left: [
        parseJSONToMap(`[[0,0], [1,0], [1,-1], [0,2], [1,2]]`), // top→left
        // ... 3 more for other starting rotations
    ],
    right: [
        // ... 4 maps for CW rotation
    ]
});
```

3. **Wire in GameFactory** to use your new rotation system.

### Adding a New Cell Skin

Two approaches exist depending on your asset format:

#### Option A: Individual Images (`fromImgs`)

1. **Add images** to `public/image/cell/<skinname>/`:
   ```
   public/image/cell/myskin/
   ├── red_n.png, red_a.png
   ├── blue_n.png, blue_a.png
   ├── ... (all colors with _n and _a variants)
   ```
   - `_n` = normal state, `_a` = alternate/ghost state

2. **Register in `viewdata.js`**:
   ```javascript
   const IMG_SKIN_DATA_INDEX_fromImg = {
       "tikin": { cellWidth: 30 },
       "myskin": { cellWidth: 30 },  // Add your skin
   }
   ```

#### Option B: Sprite Sheet (`fromSheet`)

1. **Add sprite sheet** to `public/image/cellsheet/`:
   ```
   public/image/cellsheet/myskin.png
   ```

2. **Register in `viewdata.js`**:
   ```javascript
   const IMG_SKIN_DATA_INDEX_fromSheet = {
       "nine": { cellWidth: 30 },
       "myskin": { cellWidth: 30 },  // Add your skin
   }
   ```

3. **Update bootloader.js** to load your new assets.

### Adding a New Visual Effect

1. **Create effect class** in `gameeffectview.js`:

```javascript
class MyEffect extends Phaser.GameObjects.Graphics {
    #timePassed = 0;
    #duration = 0.5;

    constructor(scene, gvContext, data) {
        super(scene);
        // Initialize effect state
    }

    update(delta_s) {
        this.#timePassed += delta_s;
        if (this.#timePassed >= this.#duration) {
            this.destroy();
        } else {
            this.#render();
        }
    }

    #render() {
        this.clear();
        // Draw effect based on #timePassed / #duration
    }
}
```

2. **Add to `GameEffectManagerView`**:

```javascript
update(delta_s) {
    // Check for triggering condition
    if (someCondition) {
        const effect = new MyEffect(this.scene, this.gvContext, data);
        this.container.add(effect);
        this.#effects.push(effect);
    }

    // Update all active effects
    this.#effects.forEach(effect => effect.update(delta_s));
    this.#effects = this.#effects.filter(e => e.active);
}
```

### Adding a New Report Type

1. **Define report class** in `report.js`:

```javascript
export class MyReport extends Report {
    /** @typedef {{ someData: any }} MyReportData */
    static type = "MyReport";
    parentClass = MyReport;

    /** @param {MyReportData} data */
    constructor(data) {
        super();
        this.data = data;
    }
}
```

2. **Add to `GameReportStack`**:

```javascript
export class GameReportStack {
    /** @type {LineClearReport[]} */ lineClear;
    /** @type {MinoSpawnReport[]} */ minoSpawn;
    /** @type {MyReport[]} */ myReport;  // Add array

    add(report) {
        switch(report.parentClass.type) {
            case LineClearReport.type:
                this.lineClear.push(report);
                break;
            case MyReport.type:          // Add case
                this.myReport.push(report);
                break;
        }
    }

    renewAll() {
        this.lineClear = [];
        this.minoSpawn = [];
        this.myReport = [];              // Clear new array
    }
}
```

3. **Controller adds**: `gameReportStack.add(new MyReport({ someData: ... }))`

4. **View consumes**: 
```javascript
for (const report of gameReportStack.myReport) {
    // Handle report
}
```

---

## See Also

- [srcFilesFunctions.md](srcFilesFunctions.md) — Detailed class and function reference
- [BoardController.md](BoardController.md) — Deep dive into board update mechanics
- [note.txt](../note.txt) — Development conventions and quick notes

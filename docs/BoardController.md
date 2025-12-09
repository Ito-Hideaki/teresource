# BoardController Class Specification

## Purpose
Coordinates the game logic for a falling Tetris piece: gravity, player input, rotation, locking, and spawning. The controller is **stateless within a single frame**—all state resides in external objects (CurrentMinoManager, Board, BoardControlState). Each `update()` call applies input + time progression deterministically.

## Dependencies
- **CurrentMinoManager**: tracks active mino and position.
- **Board**: collision detection and compositing.
- **BoardControlState**: persistent frame state (falling progress, lock-down timer, soft-drop flag).
- **MinoQueueManager**: supplies next mino on spawn.
- **ControlOrder** (private helper class): ephemeral input flags, reset every frame.

---

## Constructor
```javascript
constructor(currentMinoManager, board, state, minoQueueManager)
```
- Wires dependencies.
- Initializes `#controlOrder` internally.

---

## Public API (Input Methods)
All methods set boolean flags in `#controlOrder`, which are consumed and cleared during the next `update()`:

- **moveMinoLeft()**: requests leftward move by 1 column.
- **moveMinoRight()**: requests rightward move by 1 column.
- **startSoftDrop()**: enables fast-fall (20x gravity multiplier).
- **stopSoftDrop()**: disables fast-fall.
- **hardDrop()**: instant drop to bottom + immediate placement.
- **rotateClockWise()**: requests 90° CW rotation.
- **rotateCounterClock()**: requests 90° CCW rotation.

---

## Public API (Update Method)
```javascript
update(deltaTime = 0.016667)
```
Called once per frame (default ~60fps). Execution order:

1. **Spawn new mino** if current is placed (`#update_newMino()`).
2. **Rotate** if rotation input pending (`#update_rotateMino()`).
3. **Gravity + movement** (`#update_gravityAndMove(deltaTime)`):
   - Handle soft-drop start/stop.
   - Accumulate falling progress (gravity).
   - Horizontal movement (if input present).
   - Vertical drop (per accumulated progress).
   - Hard drop if requested.
   - Returns true if hard-dropped.
4. **Clear input flags** (`#controlOrder.setFalseAll()`).
5. **Lock-down timer** (`#update_lockDown(deltaTime)`):
   - If mino is grounded, increment timer.
   - Lock after 0.5 seconds of ground contact.
   - Returns true if locked.
6. **Place mino** if hard-dropped or locked (`#update_placeMino()`).
7. **Spawn new mino** if just placed.

---

## Private Update Methods

### `#update_newMino()`
- Takes next mino from queue.
- Calls `currentMinoManager.startNextMino(mino)`.
- Resets `fallingProgress` and `lockDownCount` to 0.

### `#update_rotateMino()`
- Checks `rotateClockWise` or `rotateCounterClock` flags.
- Copies mino with 90°/270° rotation.
- If no collision at current position, applies rotation and resets lock-down timer.
- Otherwise, rotation is ignored (no wall kicks).

### `#update_gravityAndMove(deltaTime): boolean`
- **Soft-drop toggling**: sets `state.softDrop` flag.
- **Gravity accumulation**:
  - Base rate: `deltaTime * 60 * 0.02` (1.2 cells/sec at 60fps).
  - Multiplied by 20 if soft-dropping.
  - Resets to 0 if mino is grounded.
- **Loop** while `fallingProgress >= 1`:
  - **Horizontal move**: consumes `moveLeft`/`moveRight`, applies legal move, resets lock timer if successful.
  - **Vertical fall**: decrements `fallingProgress` by 1, drops 1 row if legal, resets lock timer if moved.
  - **Hard drop**: drops 99 rows (guaranteed to hit ground), sets placement flag, exits.
- Returns true if hard-dropped.

### `#update_lockDown(deltaTime): boolean`
- If mino has collision 1 row below:
  - Increment `lockDownCount` by `deltaTime`.
  - Lock if timer exceeds 0.5 seconds.
- Else, reset `lockDownCount` to 0.
- Returns true if locked.

### `#update_placeMino()`
- Converts current mino to table.
- Composites onto board at mino's position + top-left offset.
- Calls `currentMinoManager.place()` to mark as placed.

### `#moveMinoVertically(move: number): number`
- Calls `Board.tryMoveMinoVertically(move, mino, row, column)`.
- Updates `currentMinoManager.row`.
- Returns actual move distance.

### `#moveMinoHorizontally(move: number): number`
- Calls `Board.tryMoveMinoHorizontally(move, mino, row, column)`.
- Updates `currentMinoManager.column`.
- Returns actual move distance.

---

## Helper Class: ControlOrder
Ephemeral input buffer with boolean flags:
- `moveLeft`, `moveRight`
- `startSoftDrop`, `stopSoftDrop`, `hardDrop`
- `rotateClockWise`, `rotateCounterClock`, `rotate180` (unused)

Method `setFalseAll()` clears all flags after processing.

---

## Helper Class: BoardControlState
Persistent frame state:
- `fallingProgress: number` - accumulated gravity (increments toward 1.0 = 1 cell drop)
- `lockDownCount: number` - time mino has been grounded (seconds)
- `softDrop: boolean` - whether soft-drop is active

---

## Behavioral Notes

- **Lock-down timer resets** on:
  - Successful horizontal move.
  - Vertical drop (falling or manual).
  - Successful rotation.
- **Gravity speed**:
  - Normal: ~1.2 cells/sec.
  - Soft-drop: ~24 cells/sec.
- **Hard drop** bypasses lock timer entirely.
- **No wall kicks**: rotation fails silently if collision detected.
- **Single horizontal input per frame**: only one direction processed (right takes precedence if both set).
- **Multiple gravity steps per frame** possible at extreme speeds (loop ensures all accumulated progress is consumed).

---

## State Ownership
- BoardController owns timing and input logic.
- CurrentMinoManager owns mino instance and position.
- Board owns cell grid and collision.
- BoardControlState owns frame counters (falling progress, lock timer, soft-drop flag).

This separation enables deterministic replay and simplifies testing.

---

## Usage Example
```javascript
const state = new BoardControlState();
const controller = new BoardController(
  currentMinoManager,
  board,
  state,
  minoQueueManager
);

// Input handling
controller.moveMinoLeft();
controller.rotateClockWise();

// Game loop
function update(deltaTime) {
  controller.update(deltaTime);
}
```

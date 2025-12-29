# Source Files and Their Functions

This document provides a brief description of the function of each source file in the `src/` directory.

## Root Directory

- [src/teresource.js](src/teresource.js): The entry point of the application. It initializes the Phaser game instance with the `PlayScene`.
- [src/phaser-shim.js](src/phaser-shim.js): A simple shim that exports the global `Phaser` object for use in other modules.

## Utility

- [src/teresource/util.js](src/teresource/util.js): Contains general-purpose utility classes and functions, such as unique key generation, function update management, coordinate calculations, and array shuffling.

## Scenes

- [src/teresource/scenes/play.js](src/teresource/scenes/play.js): The main game scene (`PlayScene`). It handles asset preloading, game object creation via `GameFactory`, and player input mapping.

### Play Scene Components

- [src/teresource/scenes/play/boardcontroller.js](src/teresource/scenes/play/boardcontroller.js): Manages the logic for updating the board state based on player input (control orders), including movement, rotation, and gravity.
- [src/teresource/scenes/play/boarddeco.js](src/teresource/scenes/play/boarddeco.js): Responsible for drawing static decorative elements of the board, such as the background and grid lines.
- [src/teresource/scenes/play/boardview.js](src/teresource/scenes/play/boardview.js): Handles the visual representation of the game board, rendering individual cells using images from a cell sheet.
- [src/teresource/scenes/play/context.js](src/teresource/scenes/play/context.js): Defines `GameContext` and `GameViewContext` classes, which act as containers for shared game state and view-related objects.
- [src/teresource/scenes/play/customtexture.js](src/teresource/scenes/play/customtexture.js): Manages custom textures for game cells, specifically handling the creation of cell sheets and individual frames from preloaded images.
- [src/teresource/scenes/play/gamecontroller.js](src/teresource/scenes/play/gamecontroller.js): Manages the high-level game logic for a player, including starting new minos, processing control orders, and triggering line clears.
- [src/teresource/scenes/play/gamefactory.js](src/teresource/scenes/play/gamefactory.js): A factory class responsible for instantiating and wiring together the various components of the game (board, managers, controllers, contexts).
- [src/teresource/scenes/play/lineclear.js](src/teresource/scenes/play/lineclear.js): Handles the detection and execution of line clears when a row is completely filled with blocks.
- [src/teresource/scenes/play/mechanics.js](src/teresource/scenes/play/mechanics.js): Defines the core data structures and logic for the game, such as `Mino` shapes, `Cell` properties, and the `CellBoard`.
- [src/teresource/scenes/play/minomanager.js](src/teresource/scenes/play/minomanager.js): Manages the current active mino, the mino queue, and the "bag" system for generating new minos.
- [src/teresource/scenes/play/rotationsystem.js](src/teresource/scenes/play/rotationsystem.js): Implements rotation logic for minos, including support for wall kicks (SRS-like) and different rotation systems.
- [src/teresource/scenes/play/viewcontroller.js](src/teresource/scenes/play/viewcontroller.js): Coordinates the visual components of the game, managing the `BoardView` and `BoardDeco` within a Phaser container.
- [src/teresource/scenes/play/viewmechanics.js](src/teresource/scenes/play/viewmechanics.js): Contains constants and utility functions for mapping game state (cells, colors, status) to visual parameters (textures, frames, skins).

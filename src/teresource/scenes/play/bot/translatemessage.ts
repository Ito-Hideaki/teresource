import { CellBoard } from "../core/mechanics";
import * as Core from "./core";

//** return a difference of the origin from SRS true rotation in teresource-style coordinate */
function translateOrientation(type: Core.MinoType, orientation: Core.Orientation) {
    const rotation = {"north": 0, "east": 90, "south": 180, "west": 270}[orientation];
    const rotationIndex = rotation / 4;
    switch(type) {
        case "S":
        case "Z":
        case "J":
        case "L":
        case "T":
            return { sx: 0, sy: 0, rotation };
        case "I":
            return {
                sx: [0, -1, -1, 0][rotationIndex],
                sy: [0, 0, 1, 1][rotationIndex],
                rotation
            };
        case "O":
            return {
                sx: [0, 0, -1, -1][rotationIndex],
                sy: [-1, 0, 0, -1][rotationIndex],
                rotation
            };
    }
};

function translateLocation(location: Core.Location, board: CellBoard) {
    const { sx, sy, rotation } = translateOrientation(location.type, location.orientation);
    const y = board.rowCount - 1 - location.y + sy;
    const x = location.x + sx;
    return { type: location.type, x, y, rotation };
};
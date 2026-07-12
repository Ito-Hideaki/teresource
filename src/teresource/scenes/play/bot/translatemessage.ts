import { CellBoard } from "../core/mechanics";
import * as TBP from "./core";
import * as TRS from "./trscore";

//** return a difference of the origin from SRS true rotation in teresource-style coordinate */
function translateOrientation(type: TBP.MinoType, orientation: TBP.Orientation) {
    const rotation = {"north": 0, "east": 90, "south": 180, "west": 270}[orientation];
    const rotationIndex = rotation / 90;
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

export function translateLocation(location: TBP.Location, board: CellBoard): TRS.Location {
    const { sx, sy, rotation } = translateOrientation(location.type, location.orientation);
    const y = board.rowCount - 1 - location.y + sy;
    const x = location.x + sx;
    return { type: TRS.MINO_TYPE_MAP[location.type], x, y, rotation };
};
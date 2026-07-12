import * as TBP from "./core";
import { MinoType } from "../core/coredata";

export const MINO_TYPE_MAP: { [property in TBP.MinoType] : MinoType } = {
    "J" : "j",
    "I" : "i",
    "L" : "l",
    "O" : "o",
    "T" : "t",
    "Z" : "z",
    "S" : "s"
} as const;

export type Location = {
    x: number;
    y: number;
    rotation: number;
    type: MinoType;
};
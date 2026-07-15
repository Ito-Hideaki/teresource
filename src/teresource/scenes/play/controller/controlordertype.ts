import { BoardUpdateDiff } from "./boardcontroller";
import { ControlOrder } from "./controlorder";

export interface ControlOrderProvider {
    resetARR: () => void;
    provideControlOrder: () => ControlOrder;
    advanceTime: (deltaTime: number) => void;
    recieveControlResult: (controlDiff: BoardUpdateDiff) => void;
};
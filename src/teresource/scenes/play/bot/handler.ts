import { GameAttackState } from "../core/attack";
import { Cell, CellBoard, Mino } from "../core/mechanics";
import { MinoQueueManager } from "../core/minomanager";
import { GameContext, GameHighContext } from "../infra/context";
import { ControlOrder, ControlOrderProvider } from "../controller/controlorder";

export type BotConfig = { type: "test1" | "test2" };

function minoChar(mino: Mino) {
    return mino.type.toUpperCase();
}

function cellChar(cell: Cell) {
    if(cell.isBlock) {
        return "G";
    } else {
        return null;
    }
}

function createStartMessageCreator(gameContext: GameContext, gameAttackState: GameAttackState) {
    const { cellBoard, minoQueueManager, heldMinoManager } = gameContext;
    return function() {
        const heldMino = heldMinoManager.getMino();
        const board = new Array(40).fill(0).map((_, i) => {
        const cellRow = cellBoard.table.at(-i);
        if(cellRow) return new Array(10).fill(0).map((_, j) => {
                const cell = cellRow.at(j);
                if(cell) return cellChar(cell);
                else return null;
            });
            else return new Array(10).fill(null);
        });
        return {
            type: "start",
            hold: heldMino ? minoChar(heldMino) : null,
            queue: minoQueueManager.minoQueue.map(mino => minoChar(mino)),
            combo: gameAttackState.combo,
            back_to_back: gameAttackState.B2B,
            board
        }
    }
}

function sendJson(json: string) {
    console.log(json);
}

export class TBPHandler {
    terminated: boolean;
    private controlOrderProvider;

    constructor(controlOrderProvider: ControlOrderProvider) {
        this.terminated = false;
        this.controlOrderProvider = controlOrderProvider;
    }

    quit() {
        //terminate bot
        this.terminated = true;
    }
}

export function createTBPHandler(config: BotConfig, gameContext: GameContext, gameHighContext: GameHighContext) {
    return new TBPHandler(gameHighContext.controlOrderProvider);
};
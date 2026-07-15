import { BotControlOrderProvider } from "../bot/controlorder";
import { BoardUpdateDiff } from "./boardcontroller";
import { ControlOrder, ControlOrderProviderConfig, HumanControlOrderProvider } from "./controlorder";

export type ControlOrderProvider = HumanControlOrderProvider | BotControlOrderProvider;

export type ControlOrderProviderNeedInit = (config: ControlOrderProviderConfig) => ControlOrderProvider;

export function createControlOrderProviderNeedInit(controlOrderProvider: ControlOrderProvider): ControlOrderProviderNeedInit {
    return function(config: ControlOrderProviderConfig) {
        controlOrderProvider.init(config);
        return controlOrderProvider;
    }
}
import { BotControlOrderProvider } from "../bot/controlorder";
import { BoardUpdateDiff } from "./boardcontroller";
import { ControlOrder, ControlOrderProviderConfig, HumanControlOrderProvider } from "./controlorder";

export type ControlOrderProvider = HumanControlOrderProvider | BotControlOrderProvider;

export type ControlOrderProviderCreator = (config: ControlOrderProviderConfig) => ControlOrderProvider;
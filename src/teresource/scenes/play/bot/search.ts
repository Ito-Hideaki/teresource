import { MinoType } from "../core/coredata";
import { GameContext } from "../infra/context";
import * as TRS from "./trscore";

type Node = {
    location: TRS.Location;
    depth: number;
    parent: Node | undefined;
};

type NodeCell = { [k: number]: Node };
type NodeRow = { [k: number]: NodeCell };
type NodeBoard = { [k: number]: NodeRow };

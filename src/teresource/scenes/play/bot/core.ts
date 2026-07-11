export type MinoType = "S" | "T" | "Z" | "I" | "O" | "J" | "L";
export type Orientation = "east" | "west" | "south" | "north";
export type Spin = "none" | "full" | "mini";

export type Location = {
    type: MinoType,
    orientation: Orientation,
    x: number,
    y: number
};

export type Move = {
    location: Location,
    spin: Spin
};

export type InfoMessage = {
    type: "info",
    name: string,
    version: string,
    author: string,
    features: Array<any>
};

export type ReadyMessage = {
    type: "ready"
};

export type SuggestionMessage = {
    type: "suggestion",
    moves: Move[]
};

export type BotMessage = InfoMessage | ReadyMessage | SuggestionMessage;
export const cellColorStr = [
    "red",
    "orange",
    "yellow",
    "green",
    "sky",
    "blue",
    "purple",
    "grey",
    "black"
]

/** @typedef { { shape: import("./mechanics").MinoShape, color: string } } MinoData */
/** @type {Object<string, MinoData>} */
export const MINO_DATA_LIST = {
    "z" : {
        shape: {
            size: 3,
            origin: {
                x: 1,
                y: 1,
            },
            map: [
                [1, 1, 0],
                [0, 1, 1],
                [0, 0, 0],
            ]
        },
        color: "red",
    },
    "l" : {
        shape: {
            size: 3,
            origin: {
                x: 1,
                y: 1,
            },
            map: [
                [0, 0, 1],
                [1, 1, 1],
                [0, 0, 0],
            ]
        },
        color: "orange",
    },
    "o": {
        shape: {
            size: 2,
            origin: {
                x: 0,
                y: 1,
            },
            map: [
                [1, 1],
                [1, 1],
            ]
        },
        color: "yellow",
    },
    "s": {
        shape: {
            size: 3,
            origin: {
                x: 1,
                y: 1,
            },
            map: [
                [0, 1, 1],
                [1, 1, 0],
                [0, 0, 0],
            ]
        },
        color: "green",
    },
    "i": {
        shape: {
            size: 4,
            origin: {
                x: 1,
                y: 1,
            },
            map: [
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ]
        },
        color: "sky",
    },
    "j": {
        shape: {
            size: 3,
            origin: {
                x: 1,
                y: 1,
            },
            map: [
                [1, 0, 0],
                [1, 1, 1],
                [0, 0, 0],
            ]
        },
        color: "blue",
    },
    "t": {
        shape: {
            size: 3,
            origin: {
                x: 1,
                y: 1,
            },
            map: [
                [0, 1, 0],
                [1, 1, 1],
                [0, 0, 0],
            ]
        },
        color: "purple",
    }
}
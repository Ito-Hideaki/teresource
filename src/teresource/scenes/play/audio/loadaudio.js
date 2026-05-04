import { viteURLify } from "#util";
import Phaser from "phaser";

const SOUND_EFFECT_FILES = {
    "mino_hard_drop" : "ミノハードドロップ.mp3"
}

const AUDIO_FILES = {
    ...SOUND_EFFECT_FILES
}

/** @param { Phaser.Scene } scene */
export function loadAudio(scene) {
    for(const key in AUDIO_FILES) {
        scene.load.audio(key, viteURLify(`audio/${AUDIO_FILES[key]}`))
    }
}
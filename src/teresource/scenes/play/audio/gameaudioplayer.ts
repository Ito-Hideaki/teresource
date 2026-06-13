import { GameReportStack } from "../controller/report";
import Phaser from "phaser";
import { LineClearAttackData } from "../core/attack";

export class GameAudioPlayer {
    constructor(private scene: Phaser.Scene, private reportStack: GameReportStack) {}

    update() {
        const store = this.reportStack.store;
        const lineClearAttackData = store.LineClear.length ? store.LineClear[0].data : undefined;

        if(lineClearAttackData) {
            this.playPlacingSound(lineClearAttackData);
        } else {
            if(store.Hold.length) this.scene.sound.play("mino_hold");

            if(store.MinoFall.length) this.scene.sound.play("mino_fall");

            if(store.MinoHorizontalMove.length) this.scene.sound.play("mino_move_horizontal");

            if(store.MinoRotate.length) {
                if(store.SpecialRotate.length) {
                    this.scene.sound.play("mino_rotate_special");
                } else {
                    this.scene.sound.play("mino_rotate");
                }
            }
        }
    }

    playPlacingSound(lineClearAttackData: LineClearAttackData) {
        if(lineClearAttackData.clearedRowList.length) {
            //play line clear sound
        } else {
            if (this.reportStack.store.HardDrop.length) {
                this.scene.sound.play("mino_hard_drop");
            }
            if (this.reportStack.store.LockDown.length) {
                this.scene.sound.play("mino_lock");
            }
        }
    }
}
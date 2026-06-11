import { GameReportStack, ReportStack } from "../controller/report";
import Phaser from "phaser";
import { LineClearAttackData } from "../core/attack";

export class GameAudioPlayer {
    constructor(private scene: Phaser.Scene, private reportStack: GameReportStack) {}

    update() {
        const lineClearAttackData = this.reportStack.lineClear.length ? this.reportStack.lineClear[0].data : undefined;

        if(lineClearAttackData) {
            this.playPlacingSound(lineClearAttackData);
        } else {
            if(this.reportStack.minoFall.length) this.scene.sound.play("mino_fall");

            if(this.reportStack.minoHorizontalMove.length) this.scene.sound.play("mino_move_horizontal");

            if(this.reportStack.minoRotate.length) {
                if(this.reportStack.specialRotate.length) {
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
            if (this.reportStack.hardDrop.length) {
                this.scene.sound.play("mino_hard_drop");
            }
        }
    }
}
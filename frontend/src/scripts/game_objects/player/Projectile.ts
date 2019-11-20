import Graphics = PIXI.Graphics;
import {Player} from "./Player";

export class Projectile {
    private graphics = new Graphics();
    private shooter: Player;

    constructor(shooter: Player, size: number) {
        this.shooter = shooter;

        this.graphics.beginFill(0xffffff, 0.5);
        this.graphics.drawRect(0, 0, size/4, size);
        this.graphics.endFill();
    }
}
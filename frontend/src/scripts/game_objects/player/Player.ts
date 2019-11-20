import {Graphics} from "pixi.js";
import DisplayObject = PIXI.DisplayObject;
import {PlayerState} from "../../shared/enums/PlayerState.enum";
import {RotatedPosition} from "../../shared/interfaces/RotatedPosition.interface";

export class Player {
    public state = PlayerState.ALIVE;
    private graphics = new Graphics();
    private color: number;

    constructor(color: number, size: number) {
        this.color = color;

        this.graphics.beginFill(0xffffff);
        this.graphics.drawCircle(size / 2, size / 2, size);
        this.graphics.endFill();
        this.graphics.beginFill(0xffffff);
        this.graphics.drawPolygon([-size, -size, -1.15 * size, 0.25 * size, 0.25 * size, -1.15 * size]);
        this.graphics.endFill();
        this.graphics.lineStyle(size / 4, 0xffffff);
        this.graphics.drawCircle(size / 2, size / 2, 1.5 * size);
        this.graphics.endFill();

        this.graphics.rotation = Math.PI / 4;
    }

    toRotatedPosition(position: RotatedPosition): Player {
        this.graphics.x = position.position.x;
        this.graphics.y = position.position.y;
        this.graphics.rotation = position.rotation + Math.PI / 4;
        return this;
    }

    getGraphics(): DisplayObject {
        return this.graphics;
    }
}

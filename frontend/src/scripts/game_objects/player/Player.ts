import {Graphics} from "pixi.js";
import DisplayObject = PIXI.DisplayObject;

export class Player {
    private graphics = new Graphics();
    private name: string;

    constructor(name: string, color: number, size: number) {
        this.name = name;

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

    toPosition(x: number, y: number) {
        this.graphics.x = x;
        this.graphics.y = y;
        return this;
    }

    toRotation(rotation: number): Player {
        this.graphics.rotation = rotation + Math.PI / 4;
        return this;
    }

    getGraphics(): DisplayObject {
        return this.graphics;
    }
}

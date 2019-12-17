import {Graphics, DisplayObject} from 'pixi.js';
import {RotatedPosition} from "../interfaces/RotatedPosition.interface";

export abstract class MovableGraphics {
    protected graphics: Graphics = new Graphics();
    protected angleFixup: number = 0;

    public toRotatedPosition(position: RotatedPosition): this {
        this.graphics.x = position.position.x;
        this.graphics.y = position.position.y;
        this.graphics.rotation = position.rotation*Math.PI/180 + this.angleFixup;
        return this;
    }

    public getGraphics(): DisplayObject {
        return this.graphics;
    }
}

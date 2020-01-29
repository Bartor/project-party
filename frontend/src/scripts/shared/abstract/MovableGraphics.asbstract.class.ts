import {Graphics, DisplayObject} from 'pixi.js';
import {RotatedPosition} from "../interfaces/RotatedPosition.interface";

/**
 * A single object which can be moved.
 */
export abstract class MovableGraphics {
    protected graphics: Graphics = new Graphics();
    protected angleFixup: number = 0;

    /**
     * Rotate and move this object.
     * @param position A new rotated position for this object.
     * @return this, allows for chaining.
     */
    public toRotatedPosition(position: RotatedPosition): this {
        this.graphics.x = position.position.x;
        this.graphics.y = position.position.y;
        this.graphics.rotation = position.rotation*Math.PI/180 + this.angleFixup;
        return this;
    }

    /**
     * Return graphics of this object.
     * @return Graphics of this object.
     */
    public getGraphics(): DisplayObject {
        return this.graphics;
    }
}

import {MovableGraphics} from "../../shared/abstract/MovableGraphics.asbstract.class";

/**
 * A single projectile on the map.
 */
export class Projectile extends MovableGraphics {
    public marked: boolean = true;

    constructor(size: number) {
        super();
        this.angleFixup = Math.PI / 2;

        this.graphics.beginFill(0xffffff, 1);
        this.graphics.drawRect(0, 0, size / 4, size);
        this.graphics.endFill();
    }
}

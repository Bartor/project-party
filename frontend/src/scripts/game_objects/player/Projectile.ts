import {MovableGraphics} from "../../shared/abstract/MovableGraphics.asbstract.class";

export class Projectile extends MovableGraphics {
    public marked: boolean = true;

    constructor(size: number) {
        super();
        this.angleFixup = Math.PI / 2;

        this.graphics.beginFill(0xffffff, 0.5);
        this.graphics.drawRect(0, 0, size / 4, size);
        this.graphics.endFill();
    }
}

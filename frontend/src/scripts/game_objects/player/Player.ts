import {PlayerState} from "../../shared/enums/PlayerState.enum";
import {MovableGraphics} from "../../shared/abstract/MovableGraphics.asbstract.class";

export class Player extends MovableGraphics {
    public state = PlayerState.ALIVE;
    private color: number;

    constructor(color: number, size: number) {
        super();
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
}

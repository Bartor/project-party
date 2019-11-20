import {Graphics} from "pixi.js";

export class Obstacle {
    private graphics = new Graphics();

    constructor(vertices: number[]) {
        this.graphics.beginFill(0xffffff);
        this.graphics.drawPolygon(vertices);
        this.graphics.endFill();
    }
}
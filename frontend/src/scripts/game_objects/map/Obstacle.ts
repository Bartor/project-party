import {Graphics} from "pixi.js";
import {Point} from "../../shared/interfaces/Point.interface";

export class Obstacle {
    private graphics = new Graphics();

    constructor(vertices: Point[]) {
        this.graphics.beginFill(0xffffff);
        this.graphics.drawPolygon(vertices.reduce((acc, v) => [...acc, v.x, v.y], []));
        this.graphics.endFill();
    }

    public getGraphics() {
        return this.graphics;
    }
}
import {Graphics} from "pixi.js";

export class Obstacle {
    private graphics = new Graphics();

    constructor(vertices: number[], hole: number[] = []) {
        this.graphics.beginFill(0xffffff)
            .drawPolygon(vertices);
        if (hole.length) {
            this.graphics.beginHole()
                .drawPolygon(hole)
                .endHole()
        }
        this.graphics.endFill();
    }

    public getGraphics() {
        return this.graphics;
    }
}

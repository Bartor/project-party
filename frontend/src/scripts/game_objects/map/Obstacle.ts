import {Graphics} from "pixi.js";

/**
 * A single obstacle polygon.
 */
export class Obstacle {
    private graphics = new Graphics();

    /**
     * Create a new obstacle polygon instance.
     * @param vertices Vertices of the polygon.
     * @param hole A polygon hole which should be cut out of the vertices.
     */
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

    /**
     * Return this obstacle's graphics.
     * @return This obstacle's graphics.
     */
    public getGraphics() {
        return this.graphics;
    }
}

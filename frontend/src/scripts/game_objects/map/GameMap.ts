import {Obstacle} from "./Obstacle";

/**
 * A consolidation of obstacles.
 */
export class GameMap {
    private obstacles: Obstacle[] = [];

    /**
     * Create a new map instance from obstacles array.
     * @param obstacles An array of arrays in the form [[x0, y0, x1, y1, x2, y2, ...], ...]
     * where x, y pairs in an array describe a single polygon's vertices.
     */
    constructor(obstacles: number[][]) {
        if (obstacles.length > 2) {
            this.obstacles.push(new Obstacle(obstacles[0], obstacles[1]));
            for (let obstacle of obstacles.slice(2)) {
                this.obstacles.push(new Obstacle(obstacle));
            }
        }
    }

    /**
     * Get add obstacle graphics.
     * @return An array of obstacle graphics.
     */
    public getGraphics() {
        return this.obstacles.map(obstacle => obstacle.getGraphics());
    }
}

import {Obstacle} from "./Obstacle";

export class GameMap {
    private obstacles: Obstacle[] = [];

    constructor(obstacles: number[][]) {
        if (obstacles.length > 2) {
            this.obstacles.push(new Obstacle(obstacles[0], obstacles[1]));
            for (let obstacle of obstacles.slice(2)) {
                this.obstacles.push(new Obstacle(obstacle));
            }
        }
    }

    public getGraphics() {
        return this.obstacles.map(obstacle => obstacle.getGraphics());
    }
}

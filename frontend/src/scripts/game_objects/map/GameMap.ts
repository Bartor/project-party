import {Obstacle} from "./Obstacle";
import {Point} from "../../shared/interfaces/Point.interface";

export class GameMap {
    private obstacles: Obstacle[] = [];

    constructor(obstacles: Point[][]) {
        for (let obstacle of obstacles) {
            this.obstacles.push(new Obstacle(obstacle));
        }
    }

    public getGraphics() {
        return this.obstacles.map(obstacle => obstacle.getGraphics());
    }
}
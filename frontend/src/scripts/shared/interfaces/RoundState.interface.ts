import {Point} from "./Point.interface";
import {RotatedPosition} from "./PlayerPosition.interface";

export interface RoundState {
    map: Array<Array<Point>>
    playerPositions: Map<string, RotatedPosition>
}
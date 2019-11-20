import {Point} from "./Point.interface";
import {RotatedPosition} from "./RotatedPosition.interface";

export interface RoundState {
    map: Array<Array<Point>>
    playerPositions: Map<string, RotatedPosition>
}
import {Point} from "./Point.interface";
import {RotatedPosition} from "./RotatedPosition.interface";

/**
 * A slow update about a new round.
 */
export interface RoundState {
    map: Array<Array<Point>>
    playerPositions: Map<string, RotatedPosition>
}

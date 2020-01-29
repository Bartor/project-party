import {RotatedPosition} from "./RotatedPosition.interface";

/**
 * A single "fast" update.
 */
export interface GameplayUpdate {
    playerPositions: Map<string, RotatedPosition>
    projectilePositions: Map<string, RotatedPosition>
}

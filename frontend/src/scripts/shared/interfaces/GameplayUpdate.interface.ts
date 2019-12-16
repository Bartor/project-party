import {RotatedPosition} from "./RotatedPosition.interface";

export interface GameplayUpdate {
    playerPositions: Map<string, RotatedPosition>
    projectilePositions: Map<string, RotatedPosition>
}

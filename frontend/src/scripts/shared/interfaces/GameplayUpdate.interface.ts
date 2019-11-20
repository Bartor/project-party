import {Point} from "./Point.interface";
import {PlayerState} from "../enums/PlayerState.enum";
import {RotatedPosition} from "./RotatedPosition.interface";

export interface GameplayUpdate {
    playerStates: Map<string, PlayerState>
    playerPositions: Map<string, RotatedPosition>
    projectilePositions: Array<Map<string, RotatedPosition>> //todo think about identifying projectiles
}
import {PlayerState} from "../enums/PlayerState.enum";

/**
 * Information about a player.
 */
export interface PlayerStatus {
    score: number,
    name: string,
    color: string,
    state: PlayerState
}

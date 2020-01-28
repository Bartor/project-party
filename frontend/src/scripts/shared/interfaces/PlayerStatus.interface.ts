import {PlayerState} from "../enums/PlayerState.enum";

export interface PlayerStatus {
    score: number,
    name: string,
    color: string,
    state: PlayerState
}

import {Observable} from "rxjs";
import {GameState} from "../shared/interfaces/GameState.interface";
import {RoundState} from "../shared/interfaces/RoundState.interface";

export interface CommunicationInterface {
    roundUpdates: () => Observable<RoundState>;
    gameStateUpdates: () => Observable<GameState>;
}
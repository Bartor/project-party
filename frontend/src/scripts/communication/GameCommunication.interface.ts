import {Observable} from "rxjs";
import {GameplayUpdate} from "../shared/interfaces/GameplayUpdate.interface";
import {RoundState} from "../shared/interfaces/RoundState.interface";

export interface GameCommunicationInterface {
    roundUpdates: () => Observable<RoundState>;
    gameStateUpdates: () => Observable<GameplayUpdate>;
}

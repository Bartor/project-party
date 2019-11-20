import {Observable} from "rxjs";
import {GameplayUpdate} from "../shared/interfaces/GameplayUpdate.interface";
import {RoundState} from "../shared/interfaces/RoundState.interface";

export interface CommunicationInterface {
    roundUpdates: () => Observable<RoundState>;
    gameStateUpdates: () => Observable<GameplayUpdate>;
}
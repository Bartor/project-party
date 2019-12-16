import {Observable} from "rxjs";
import {GameplayUpdate} from "./GameplayUpdate.interface";
import {RoundState} from "./RoundState.interface";

export interface GameCommunicationInterface {
    roundUpdates: Observable<RoundState>;
    gameStateUpdates: Observable<GameplayUpdate>;
}

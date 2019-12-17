import {Observable} from "rxjs";
import {GameplayUpdate} from "./GameplayUpdate.interface";
import {GameInfo} from "./GameInfo.interface";

export interface GameCommunicationInterface {
    gameinfoUpdates: Observable<GameInfo>;
    gameplayUpdates: Observable<GameplayUpdate>;
    startGameplayUpdates: (gameId: string) => void;
}

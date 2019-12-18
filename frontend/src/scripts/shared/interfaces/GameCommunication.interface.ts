import {Observable} from "rxjs";
import {GameplayUpdate} from "./GameplayUpdate.interface";
import {GameinfoUpdate} from "./GamenfoUpdate.interface";

export interface GameCommunicationInterface {
    gameinfoUpdates: Observable<GameinfoUpdate>;
    gameplayUpdates: Observable<GameplayUpdate>;
    startGameplayUpdates: (gameId: string) => void;
    resizeDimensions: { width: number, height: number }
}

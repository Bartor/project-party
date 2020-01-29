import {Observable} from "rxjs";
import {GameplayUpdate} from "./GameplayUpdate.interface";
import {GameinfoUpdate} from "./GamenfoUpdate.interface";

/**
 * An interface which all GameCommunication should fulfil.
 */
export interface GameCommunicationInterface {
    /**
     * "Slow" updates about new rounds, new players and scoreboard updates.
     */
    gameinfoUpdates: Observable<GameinfoUpdate>;
    /**
     * "Fast" updates about players positions and projectiles.
     */
    gameplayUpdates: Observable<GameplayUpdate>;
    /**
     * Start fetching the fast updates.
     * @param gameId Id of the game.
     */
    startGameplayUpdates: (gameId: string) => void;
    /**
     * Dimensions of the screen this class should resize to.
     */
    resizeDimensions: { width: number, height: number }
}

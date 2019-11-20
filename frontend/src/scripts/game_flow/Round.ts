import {GameMap} from "../game_objects/map/GameMap";
import {Player} from "../game_objects/player/Player";
import {Projectile} from "../game_objects/player/Projectile";
import {Observable} from "rxjs";
import {GameplayUpdate} from "../shared/interfaces/GameplayUpdate.interface";

export class Round {
    private map: GameMap;
    private players: Map<string, Player>;
    private projectiles: Map<string, Projectile> = new Map();

    constructor(players: Map<string, Player>, map: GameMap, gameUpdates: Observable<GameplayUpdate>) {
        this.players = players;
        this.map = map;

        gameUpdates.subscribe(update => {
            update.playerStates.forEach((state, name) => {
                this.players.get(name).state = state;
            });
            update.playerPositions.forEach((position, name) => {
                this.players.get(name).toRotatedPosition(position);
            });
        });
    }
}
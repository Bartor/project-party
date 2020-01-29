import {GameMap} from "../game_objects/map/GameMap";
import {Player} from "../game_objects/player/Player";
import {Projectile} from "../game_objects/player/Projectile";
import {Observable, Subject, Subscription} from "rxjs";
import {GameplayUpdate} from "../shared/interfaces/GameplayUpdate.interface";
import {PlayerState} from "../shared/enums/PlayerState.enum";
import DisplayObject = PIXI.DisplayObject;

/**
 * A single round in the game.
 */
export class Round {
    private subscription: Subscription;
    private players: Map<string, Player>;
    private projectiles: Map<string, Projectile> = new Map();

    private projectileSubject = new Subject<DisplayObject[]>();
    public projectileUpdates = this.projectileSubject.asObservable();

    /**
     * Create a new Round instance with a given set of players.
     * @param players Players to be included in this round.
     * @param gameUpdates A place the gameplay updates should be taken from.
     */
    constructor(players: Map<string, Player>, gameUpdates: Observable<GameplayUpdate>) {
        this.players = players;

        this.subscription = gameUpdates.subscribe(update => {
            this.players.forEach(player => player.state = PlayerState.SCHRODINGER);
            this.projectiles.forEach(projectile => projectile.marked = false);

            update.playerPositions.forEach((position, name) => {
                this.players.get(name).state = PlayerState.ALIVE;
                this.players.get(name).toRotatedPosition(position);
            });
            update.projectilePositions.forEach((position, name) => {
                let projectile = this.projectiles.get(name);
                if (projectile) {
                    projectile.marked = true;
                    projectile.toRotatedPosition(position);
                } else {
                    this.projectiles.set(name, new Projectile(10).toRotatedPosition(position));
                }
            });

            // this line is base on the fact that PlayerState.SCHRODINGER is 0; if enums will ever change, it'll stop
            // working
            this.players.forEach(player => player.state = player.state || PlayerState.DEAD);
            this.projectiles.forEach((projectile, name) => {
                if (!projectile.marked) {
                    this.projectiles.delete(name);
                }
            });
            this.projectileSubject.next([...this.projectiles.values()].map(p => p.getGraphics()));
        });
    }

    /**
     * End this round; unsubscribes from observables and completes its own.
     */
    public end() {
        this.projectileSubject.complete();
        this.subscription.unsubscribe();
    }
}

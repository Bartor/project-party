import {Player} from "../game_objects/player/Player";
import {Exceptions} from "../shared/enums/Exceptions.enum";
import {GameCommunicationInterface} from "../shared/interfaces/GameCommunication.interface";
import {GameMap} from "../game_objects/map/GameMap";
import {PlayerState} from "../shared/enums/PlayerState.enum";
import {Round} from "./Round";
import {Subject} from "rxjs";
import DisplayObject = PIXI.DisplayObject;

export class Game {
    private round: Round;
    private players: Map<string, Player> = new Map();
    private scores: Map<string, number> = new Map();

    private graphicsSubject = new Subject<DisplayObject[]>();
    public graphicsUpdates = this.graphicsSubject.asObservable();

    private readonly playerLimit: number;

    constructor(communicationService: GameCommunicationInterface, playerLimit: number = 8) {
        this.playerLimit = playerLimit;

        communicationService.roundUpdates.subscribe(update => {
            this.players.forEach(player => player.state = PlayerState.ALIVE);
            update.playerPositions.forEach((position, name) => {
                this.players.get(name).toRotatedPosition(position);
            });

            const map = new GameMap(update.map);
            const normalGraphics: DisplayObject[] = [...map.getGraphics(), ...[...this.players.values()].map(p => p.getGraphics())];
            this.graphicsSubject.next(normalGraphics);
            this.round = new Round(this.players, map, communicationService.gameStateUpdates);
            this.round.projectileUpdates.subscribe(update => {
                this.graphicsSubject.next([...normalGraphics, ...update]); // wow so smart xDDDDD
            });
        });
    }

    public addPlayer(name: string, player: Player) {
        if (this.players.has(name)) throw {message: 'This name is already taken', type: Exceptions.PLAYER_NAME_TAKEN};
        if (this.players.size === this.playerLimit) throw {message: 'Game is full', type: Exceptions.GAME_FULL};
        this.players.set(name, player);
        this.scores.set(name, 0);
    }

    public removePlayer(name: string) {
        if (!this.players.has(name)) throw {message: 'There is no such player', type: Exceptions.NO_SUCH_PLAYER};
        this.players.delete(name);
        this.scores.delete(name);
    }
}

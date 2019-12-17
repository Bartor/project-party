import {Player} from "../game_objects/player/Player";
import {Exceptions} from "../shared/enums/Exceptions.enum";
import {GameCommunicationInterface} from "../shared/interfaces/GameCommunication.interface";
import {GameMap} from "../game_objects/map/GameMap";
import {PlayerState} from "../shared/enums/PlayerState.enum";
import {Round} from "./Round";
import {Subject} from "rxjs";
import {GameinfoCommand} from "../shared/enums/GameinfoCommand.enum";
import DisplayObject = PIXI.DisplayObject;
import {RoundState} from "../shared/interfaces/RoundState.interface";

export class Game {
    private round: Round;
    private players: Map<string, Player> = new Map();
    private scores: Map<string, number> = new Map();

    private graphicsSubject = new Subject<DisplayObject[]>();
    public graphicsUpdates = this.graphicsSubject.asObservable();

    public gameId: string;

    constructor(
        private communicationService: GameCommunicationInterface,
        private readonly playerLimit: number = 8
    ) {
        communicationService.gameinfoUpdates.subscribe(update => {
            console.log('Got a gameinfo update', update);
            switch (update.command) {
                case GameinfoCommand.NEW_PLAYER:
                    const player = new Player(
                        Math.floor(Math.random() * 0xffffff),
                        10
                    );
                    this.addPlayer(update.params as string, player);
                    break;
                case GameinfoCommand.NEW_GAME:
                    this.gameId = update.params as string;
                    break;
                case GameinfoCommand.NEW_ROUND:
                    this.players.forEach(player => player.state = PlayerState.ALIVE);
                    (update.params as RoundState).playerPositions.forEach((position, name) => {
                        const p = this.players.get(name);
                        if (!p) {
                            this.players.set(name, new Player(0xffffff, 10));
                        }
                        this.players.get(name).toRotatedPosition(position);
                    });

                    const map = new GameMap(update.params.map);
                    const normalGraphics: DisplayObject[] = [...map.getGraphics(), ...[...this.players.values()].map(p => p.getGraphics())];
                    this.graphicsSubject.next(normalGraphics);
                    this.round = new Round(this.players, map, communicationService.gameplayUpdates);
                    this.round.projectileUpdates.subscribe(update => {
                        this.graphicsSubject.next([...normalGraphics, ...update]);
                    });
                    break;
                case GameinfoCommand.SCOREBOARD_UPDATE:
                    break;
            }
        });
    }

    public startGame() {
        this.communicationService.startGameplayUpdates(this.gameId);
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

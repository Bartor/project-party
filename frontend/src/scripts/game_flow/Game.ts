import {Player} from "../game_objects/player/Player";
import {Exceptions} from "../shared/enums/Exceptions.enum";
import {GameCommunicationInterface} from "../shared/interfaces/GameCommunication.interface";
import {GameMap} from "../game_objects/map/GameMap";
import {PlayerState} from "../shared/enums/PlayerState.enum";
import {Round} from "./Round";
import {Subject} from "rxjs";
import {GameinfoCommand} from "../shared/enums/GameinfoCommand.enum";
import {RoundState} from "../shared/interfaces/RoundState.interface";
import {GraphicsUpdate} from "../shared/interfaces/GraphicsUpdate.interface";
import {PLAYER_COLORS} from "../../config/config";
import {PlayerStatus} from "../shared/interfaces/PlayerStatus.interface";

/**
 * A single Game instance; holds all the players, scores and
 * changes rounds.
 */
export class Game {
    private round: Round;
    private players: Map<string, Player> = new Map();
    private statuses: Map<string, PlayerStatus> = new Map();

    private graphicsSubject = new Subject<GraphicsUpdate>();
    public graphicsUpdates = this.graphicsSubject.asObservable();

    private gameStatusUpdateSubject = new Subject<PlayerStatus[]>();
    public gameStatus = this.gameStatusUpdateSubject.asObservable();

    public gameId: string;
    public playerSize: number = 20;

    constructor(
        public readonly communicationService: GameCommunicationInterface,
        private readonly playerLimit: number = 8,
    ) {
        communicationService.gameinfoUpdates.subscribe(update => {
            switch (update.command) {
                case GameinfoCommand.NEW_PLAYER:
                    this.addPlayer(update.params.id, update.params.nickname);
                    this.updateGameStatus();

                    break;
                case GameinfoCommand.NEW_GAME:
                    this.gameId = update.params as string;
                    console.log(this.gameId);
                    break;
                case GameinfoCommand.NEW_ROUND:
                    this.players.forEach(player => player.state = PlayerState.ALIVE);
                    (update.params as RoundState).playerPositions.forEach((position, name) => {
                        this.players.get(name).toRotatedPosition(position);
                    });

                    if (this.round) this.round.end();

                    const map = new GameMap(update.params.map);

                    const mapGraphics = map.getGraphics();
                    const playerGraphics = [...this.players.values()].map(p => p.getGraphics());

                    this.graphicsSubject.next({
                        newPlayers: true,
                        newMap: true,
                        map: mapGraphics,
                        projectiles: [],
                        players: playerGraphics
                    });

                    this.round = new Round(this.players, communicationService.gameplayUpdates);
                    this.round.projectileUpdates.subscribe(update => {
                        this.graphicsSubject.next({
                            newPlayers: false,
                            newMap: false,
                            map: mapGraphics,
                            projectiles: update,
                            players: playerGraphics
                        });
                    });

                    this.updateGameStatus();
                    break;
                case GameinfoCommand.SCOREBOARD_UPDATE:
                    update.params.forEach((p: { id: string, score: number }) => {
                        this.statuses.get(p.id).score = p.score;
                    });

                    this.updateGameStatus();
                    break;
            }
        });
    }

    /**
     * Start fetching gameplay updates and start the game.
     */
    public startGame() {
        this.communicationService.startGameplayUpdates(this.gameId);
    }

    /**
     * Create and add a new Player instance to this game.
     * @param id Player's id.
     * @param nickname Player's nickname.
     */
    public addPlayer(id: string, nickname: string) {
        if (this.players.has(id)) throw {message: 'This name is already taken', type: Exceptions.PLAYER_NAME_TAKEN};
        if (this.players.size === this.playerLimit) throw {message: 'Game is full', type: Exceptions.GAME_FULL};
        const color = PLAYER_COLORS[Number(id) % PLAYER_COLORS.length];
        const player = new Player(
            color.valueOf(),
            this.playerSize
        );
        this.players.set(id, player);
        this.statuses.set(id, {
            score: 0,
            name: nickname,
            color: color.toString(),
            state: player.state
        });
    }

    /**
     * Remove a given player from this game.
     * @param id Id of the player to be removed.
     */
    public removePlayer(id: string) {
        if (!this.players.has(id)) throw {message: 'There is no such player', type: Exceptions.NO_SUCH_PLAYER};
        this.players.delete(id);
    }

    /**
     * Fetch current players' statuses and update the observable.
     */
    private updateGameStatus() {
        this.players.forEach((player, id) => {
            this.statuses.get(id).state = player.state;
        });
        this.gameStatusUpdateSubject.next([...this.statuses.values()].sort((a, b) => b.score - a.score));
    }
}

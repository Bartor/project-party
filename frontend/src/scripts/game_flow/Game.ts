import {Player} from "../game_objects/player/Player";
import {Exceptions} from "../shared/enums/Exceptions.enum";
import {CommunicationInterface} from "../communication/Communication.interface";
import {GameMap} from "../game_objects/map/GameMap";
import {PlayerState} from "../shared/enums/PlayerState.enum";
import {Round} from "./Round";

export class Game {
    private round: Round;
    private players: Map<string, Player> = new Map();
    private scores: Map<string, number> = new Map();

    private readonly playerLimit: number;

    constructor(playerLimit: number = 8, communicationService: CommunicationInterface) {
        this.playerLimit = playerLimit;

        communicationService.roundUpdates().subscribe(update => {
            this.players.forEach(player => player.state = PlayerState.ALIVE);
            update.playerPositions.forEach((position, name) => {
                this.players.get(name).toRotatedPosition(position);
            });

            this.round = new Round(this.players, new GameMap(update.map), communicationService.gameStateUpdates())
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
import {GameCommunicationInterface} from "../shared/interfaces/GameCommunication.interface";
import {Subject} from "rxjs";
import {RoundState} from "../shared/interfaces/RoundState.interface";
import {GameplayUpdate} from "../shared/interfaces/GameplayUpdate.interface";
import {WebSocketSubject} from "rxjs/webSocket";
import {RotatedPosition} from "../shared/interfaces/RotatedPosition.interface";
import {Point} from "../shared/interfaces/Point.interface";

export class GameCommunication implements GameCommunicationInterface {
    private gameplayWebsocket: WebSocketSubject<string>;
    private roundStateSocket: WebSocketSubject<string>;

    private roundSubject = new Subject<RoundState>();
    public roundUpdates = this.roundSubject.asObservable();

    private gameplaySubject = new Subject<GameplayUpdate>();
    public gameStateUpdates = this.gameplaySubject.asObservable();

    private debugRoundState = {
        map: [] as Array<Array<Point>>,
        playerPositions: new Map()
    };

    constructor(roundAddress: string, private gameplayAddress: string) {

        this.roundStateSocket = new WebSocketSubject({
            url: roundAddress,
            deserializer: packet => packet.data
        });
        this.roundStateSocket.subscribe(packet => this.parseRoundState(packet));
    }

    private startGameplayUpdates(id: string) {
        this.gameplayWebsocket = new WebSocketSubject({
            url: this.gameplayAddress + `?id=${id}`,
            deserializer: packet => packet.data
        });
        this.gameplayWebsocket.subscribe(packet => this.parseGameplay(packet));
    }

    private parseRoundState(packet: string) {
        const parts: string[] = packet.split('/');
        const command = parts[0];

        switch (command) {
            case 'NewGame':
                const gameId = parts[1];
                const map = JSON.parse(parts[2]);
                this.debugRoundState.map = map.map;
                this.roundSubject.next(this.debugRoundState);
                console.log(`Game with ${gameId} was started; got a map
                starting a new fake round`);

                this.startGameplayUpdates(gameId);
                break;
            case 'NewPlayer':
                const playerId = parts[1];
                const [x, y, rot] = parts.slice(2, 3).map(e => Number(e));
                this.debugRoundState.playerPositions.set(playerId, {position: {x: x, y: y}, rotation: rot});
                this.roundSubject.next(this.debugRoundState);

                console.log(`New player with id ${playerId} on position ${x}, ${y}, ${rot} was spawned
                starting a fake new round`);
                break;
            case 'NewScreen':
                console.log('New screen was connected');
                break;
        }
    }

    private parseGameplay(packet: string) {
        const playerPositions = new Map<string, RotatedPosition>();
        const projectilePositions = new Map<string, RotatedPosition>();

        const [players, projectiles] = packet.split(':');

        if (players) {
            for (let player of players.split(',') || []) {
                let parts = player.split('/');
                let id = parts[0];
                let x = Number(parts[1]);
                let y = Number(parts[2]);
                let rot = Number(parts[3]);

                playerPositions.set(id, {position: {x: x, y: y}, rotation: rot});
            }
        }

        if (projectiles) {
            for (let projectile of projectiles.split(',') || []) {
                let parts = projectile.split('/');
                let id = parts[0];
                let x = Number(parts[1]);
                let y = Number(parts[2]);
                let rot = Number(parts[3]);

                projectilePositions.set(id, {position: {x: x, y: y}, rotation: rot});
            }
        }

        this.gameplaySubject.next({
            playerPositions: playerPositions,
            projectilePositions: projectilePositions
        });
    }
}

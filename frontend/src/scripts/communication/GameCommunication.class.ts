import {GameCommunicationInterface} from "../shared/interfaces/GameCommunication.interface";
import {Subject} from "rxjs";
import {RoundState} from "../shared/interfaces/RoundState.interface";
import {GameplayUpdate} from "../shared/interfaces/GameplayUpdate.interface";
import {WebSocketSubject} from "rxjs/webSocket";
import {RotatedPosition} from "../shared/interfaces/RotatedPosition.interface";

export class GameCommunication implements GameCommunicationInterface {
    private websocket: WebSocketSubject<string>;

    private roundSubject = new Subject<RoundState>();
    public roundUpdates = this.roundSubject.asObservable();

    private gameplaySubject = new Subject<GameplayUpdate>();
    public gameStateUpdates = this.gameplaySubject.asObservable();

    constructor(address: string) {
        this.websocket = new WebSocketSubject({
            url: address,
            deserializer: packet => packet.data
        });
        this.websocket.subscribe(packet => this.parseAndUpdate(packet));
    }

    public simulateNewRound(playerList: string[]) {
        let playerPositions = new Map();
        playerList.forEach(player => {
            playerPositions.set(player, {position: {x: 0, y: 0}, rotation: 0});
        });
        this.roundSubject.next({
            map: [],
            playerPositions: playerPositions
        });
    }

    private parseAndUpdate(packet: string) {
        const playerPositions = new Map<string, RotatedPosition>();
        const projectilePositions = new Map<string, RotatedPosition>();

        const [players, projectiles] = packet.split(':');
        for (let player of players.split(',') || []) {
            let parts = player.split('/');
            let id = parts[0];
            let x = Number(parts[1]);
            let y = Number(parts[2]);
            let rot = Number(parts[3]);

            playerPositions.set(id, {position: {x: x, y: y}, rotation: rot});
        }
        for (let projectile of projectiles.split(',') || []) {
            let parts = projectile.split('/');
            let id = parts[0];
            let x = Number(parts[1]);
            let y = Number(parts[2]);
            let rot = Number(parts[3]);

            projectilePositions.set(id, {position: {x: x, y: y}, rotation: rot});
        }
        console.log('Received and parsed', playerPositions, projectilePositions);
        this.gameplaySubject.next({
            playerPositions: playerPositions,
            projectilePositions: projectilePositions
        });
    }
}

import {GameCommunicationInterface} from "../shared/interfaces/GameCommunication.interface";
import {Subject} from "rxjs";
import {GameplayUpdate} from "../shared/interfaces/GameplayUpdate.interface";
import {WebSocketSubject} from "rxjs/webSocket";
import {RotatedPosition} from "../shared/interfaces/RotatedPosition.interface";
import {GameinfoUpdate} from "../shared/interfaces/GamenfoUpdate.interface";
import {GameinfoCommand} from "../shared/enums/GameinfoCommand.enum";
import {RoundState} from "../shared/interfaces/RoundState.interface";

function parseRotatedPosition(packetString: string, width: number, height: number): RotatedPosition & { id: string } {
    const parts = packetString.split('/');
    return {
        id: parts[0],
        position: {
            x: Number(parts[1]) * width,
            y: Number(parts[2]) * height,
        },
        rotation: Number(parts[3])
    }
}

export class GameCommunication implements GameCommunicationInterface {
    private gameplayWebsocket: WebSocketSubject<string>;
    private gameinfoWebSocket: WebSocketSubject<string>;

    private gameinfoSubject = new Subject<GameinfoUpdate>();
    public gameinfoUpdates = this.gameinfoSubject.asObservable();

    private gameplaySubject = new Subject<GameplayUpdate>();
    public gameplayUpdates = this.gameplaySubject.asObservable();

    constructor(
        roundAddress: string,
        private gameplayAddress: string,

        private width: number,
        private heigth: number
    ) {
        this.gameinfoWebSocket = new WebSocketSubject({
            url: roundAddress,
            deserializer: packet => packet.data
        });
        this.gameinfoWebSocket.subscribe(packet => this.parseGameinfo(packet));
    }

    public startGameplayUpdates(id: string) {
        this.gameplayWebsocket = new WebSocketSubject({
            url: this.gameplayAddress + `?id=${id}`,
            deserializer: packet => packet.data
        });
        this.gameplayWebsocket.subscribe(packet => this.parseGameplay(packet));
    }

    private parseGameinfo(packet: string) { // command :: param1 :: param2 :: param3 :: ...
        const parts: string[] = packet.split('::');
        const command = parts[0];

        switch (command) {
            case 'NewGame':
                const gameId = parts[1];
                this.gameinfoSubject.next({
                    command: GameinfoCommand.NEW_GAME,
                    params: gameId
                });
                break;
            case 'NewRound':
                const playerPositions = new Map<string, RotatedPosition>();
                if (parts[1] !== '') {
                    for (let player of parts[1].split(',') || []) {
                        const res = parseRotatedPosition(player, this.width, this.heigth);
                        playerPositions.set(res.id, res);
                    }
                }
                const map = JSON.parse(parts[2]).walls.map((obs: number[]) => obs.map((pos, i) => i % 2 ? pos * this.width : pos * this.heigth));
                console.log(map);
                this.gameinfoSubject.next({
                    command: GameinfoCommand.NEW_ROUND,
                    params: {
                        playerPositions: playerPositions,
                        map: map
                    } as RoundState
                });
                break;
            case 'NewPlayer':
                const playerId = parts[1];
                this.gameinfoSubject.next({
                    command: GameinfoCommand.NEW_PLAYER,
                    params: playerId
                });
                break;
            case 'NewScreen':
                this.gameinfoSubject.next({
                    command: GameinfoCommand.NEW_SCREEN,
                    params: ''
                });
                break;
        }
    }

    private parseGameplay(packet: string) {
        const playerPositions = new Map<string, RotatedPosition>();
        const projectilePositions = new Map<string, RotatedPosition>();

        const [players, projectiles] = packet.split(':');

        if (players) {
            for (let player of players.split(',') || []) {
                const res = parseRotatedPosition(player, this.width, this.heigth);
                playerPositions.set(res.id, res);
            }
        }

        if (projectiles) {
            for (let projectile of projectiles.split(',') || []) {
                const res = parseRotatedPosition(projectile, this.width, this.heigth);
                projectilePositions.set(res.id, res);
            }
        }

        this.gameplaySubject.next({
            playerPositions: playerPositions,
            projectilePositions: projectilePositions
        });
    }
}

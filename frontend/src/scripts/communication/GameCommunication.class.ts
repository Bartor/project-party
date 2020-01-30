import {GameCommunicationInterface} from "../shared/interfaces/GameCommunication.interface";
import {Subject} from "rxjs";
import {GameplayUpdate} from "../shared/interfaces/GameplayUpdate.interface";
import {WebSocketSubject} from "rxjs/webSocket";
import {RotatedPosition} from "../shared/interfaces/RotatedPosition.interface";
import {GameinfoUpdate} from "../shared/interfaces/GamenfoUpdate.interface";
import {GameinfoCommand} from "../shared/enums/GameinfoCommand.enum";

/**
 * Parse and scale a rotated position from a packet.
 * @param packetString An original string with the data.
 * @param width A width the position should be scaled to.
 * @param height A height the position should be scale to.
 * @return A rotated position instance.
 */
function parseRotatedPosition(packetString: string, width: number, height: number): RotatedPosition & { id: string } {
    const parts = packetString.split('/');
    return {
        id: parts[0],
        position: {
            x: Number(parts[1]) * width,
            y: Number(parts[2]) * height,
        },
        rotation: Number(parts[3])
    };
}

/**
 * Communication class used in game frontend.
 */
export class GameCommunication implements GameCommunicationInterface {
    private gameplayWebsocket: WebSocketSubject<string>;
    private gameinfoWebSocket: WebSocketSubject<string>;

    private gameinfoSubject = new Subject<GameinfoUpdate>();
    public gameinfoUpdates = this.gameinfoSubject.asObservable();

    private gameplaySubject = new Subject<GameplayUpdate>();
    public gameplayUpdates = this.gameplaySubject.asObservable();

    private gameId: string;

    public readonly resizeDimensions = {
        width: 1,
        height: 1
    };

    /**
     * Create a new instance with separate addresses for round updates
     * and gameplay updates.
     * @param gameinfoAddress
     * @param gameplayAddress
     */
    constructor(
        gameinfoAddress: string,
        private gameplayAddress: string,
    ) {
        this.gameinfoWebSocket = new WebSocketSubject({
            url: gameinfoAddress,
            deserializer: packet => packet.data
        });
    }

    /**
     * Establish and test a connection.
     * @return A Promise which rejects on an error or fulfils otherwise.
     */
    public connect(): Promise<string> {
        return new Promise((resolve, reject) => {
            this.gameinfoWebSocket.subscribe(packet => {
                const result = this.parseGameinfo(packet);
                this.gameinfoSubject.next(result);

                if (result.command === GameinfoCommand.NEW_GAME) {
                    this.gameId = result.params;
                    resolve(result.params);
                }
            }, err => {
                reject(err);
            });
        });
    }

    /**
     * Start the game and start fetching gameplay updates.
     * @param id Id of the game to start fetching.
     */
    public startGameplayUpdates() {
        this.gameplayWebsocket = new WebSocketSubject({
            url: this.gameplayAddress + `?id=${this.gameId}`,
            deserializer: packet => packet.data
        });
        this.gameplayWebsocket.subscribe(packet => {
            const parsed = this.parseGameplay(packet);
            this.gameplaySubject.next(parsed);
        });
    }

    /**
     * Parse commands from gameinfo updates.
     * @param packet A gameinfo update to be parsed.
     * @return a GameinfoUpdate instance with a correct type and params.
     */
    private parseGameinfo(packet: string): GameinfoUpdate { // command :: param1 :: param2 :: param3 :: ...
        const parts: string[] = packet.split('::');
        const command = parts[0];

        let parsed: GameinfoUpdate;

        switch (command) {
            case 'NewGame':
                const gameId = parts[1];
                parsed = {
                    command: GameinfoCommand.NEW_GAME,
                    params: gameId
                };
                break;
            case 'NewRound':
                const playerPositions = new Map<string, RotatedPosition>();
                if (parts[1] !== '') {
                    for (let player of parts[1].split(',') || []) {
                        const res = parseRotatedPosition(player, this.resizeDimensions.width, this.resizeDimensions.height);
                        playerPositions.set(res.id, res);
                    }
                }
                const map = JSON.parse(parts[2]).walls.map((obs: number[]) => obs.map((pos, i) => i % 2 ? pos * this.resizeDimensions.width : pos * this.resizeDimensions.height));
                parsed = {
                    command: GameinfoCommand.NEW_ROUND,
                    params: {
                        playerPositions: playerPositions,
                        map: map
                    }
                };
                break;
            case 'NewPlayer':
                const [playerId, nickname] = parts[1].split('/');
                parsed = {
                    command: GameinfoCommand.NEW_PLAYER,
                    params: {
                        id: playerId,
                        nickname: nickname
                    }
                };
                break;
            case 'NewScreen':
                parsed = {
                    command: GameinfoCommand.NEW_SCREEN,
                    params: ''
                };
                break;
            case 'EndGame':
                const gameWinnerId = parts[1];
                parsed = {
                    command: GameinfoCommand.NEW_SCREEN,
                    params: gameWinnerId
                };
                break;
            case 'EndRound':
                const roundWinnerId = parts[1];
                parsed = {
                    command: GameinfoCommand.END_GAME,
                    params: roundWinnerId
                };
                break;
            case 'ScoreboardUpdate':
                const update = [];
                if (parts[1] !== '') {
                    for (let player of parts[1].split(',') || []) {
                        const [id, score] = player.split('/');
                        update.push({
                            id: id,
                            score: Number(score)
                        });
                    }
                }
                parsed = {
                    command: GameinfoCommand.SCOREBOARD_UPDATE,
                    params: update
                };
                break;
        }

        return parsed;
    }

    /**
     * Parse a gameplay packet (player positions, projectiles etc.).
     * @param packet A string packet to be parsed.
     * @return A GameplayUpdate instance.
     */
    private parseGameplay(packet: string): GameplayUpdate {
        const playerPositions = new Map<string, RotatedPosition>();
        const projectilePositions = new Map<string, RotatedPosition>();

        const [players, projectiles] = packet.split(':');

        if (players !== '') {
            for (let player of players.split(',') || []) {
                const res = parseRotatedPosition(player, this.resizeDimensions.width, this.resizeDimensions.height);
                playerPositions.set(res.id, res);
            }
        }

        if (projectiles !== '') {
            for (let projectile of projectiles.split(',') || []) {
                const res = parseRotatedPosition(projectile, this.resizeDimensions.width, this.resizeDimensions.height);
                projectilePositions.set(res.id, res);
            }
        }

        return {
            playerPositions: playerPositions,
            projectilePositions: projectilePositions
        };
    }
}

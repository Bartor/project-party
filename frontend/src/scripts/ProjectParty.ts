import {Application} from 'pixi.js';
import {Game} from "./game_flow/Game";
import {DOTS_PER_DIMENSION, PLAYER_SIZE} from "../config/config";
import {GameCommunicationInterface} from "./shared/interfaces/GameCommunication.interface";
import {Observable, Subject} from "rxjs";
import {PlayerStatus} from "./shared/interfaces/PlayerStatus.interface";
import {GameinfoCommand} from "./shared/enums/GameinfoCommand.enum";
import {GameMessage} from "./shared/interfaces/GameMessage.interface";
import DisplayObject = PIXI.DisplayObject;

/**
 * Draws the game on the screen.
 */
export class ProjectParty {
    private app: Application;
    private game: Game;

    public readonly scoreboardUpdates: Observable<PlayerStatus[]>;

    private gameMessagesSubject = new Subject<GameMessage>();
    public gameMessages = this.gameMessagesSubject.asObservable();

    /**
     * Creates a new instance.
     * @param container Where the game should be drawn in.
     * @param communication Communication interface to be used.
     */
    constructor(container: HTMLElement, communication: GameCommunicationInterface) {
        const biggerDimension = Math.max(container.clientHeight, container.clientWidth);

        this.app = new Application({
            antialias: true,
            height: biggerDimension,
            width: biggerDimension,
            transparent: true
        });
        container.appendChild(this.app.view);

        this.game = new Game(communication);
        this.scoreboardUpdates = this.game.status;

        this.game.playerSize = (PLAYER_SIZE / DOTS_PER_DIMENSION) * biggerDimension;
        this.game.communicationService.resizeDimensions.height = biggerDimension;
        this.game.communicationService.resizeDimensions.width = biggerDimension;

        let mapGraphics: DisplayObject[] = [];
        let playerGraphics: DisplayObject[] = [];
        let projectileGraphics: DisplayObject[] = [];

        this.game.graphicsUpdates.subscribe(update => {
            let newProjectileGraphics = [];
            for (let graphic of projectileGraphics) {
                if (!update.projectiles.includes(graphic)) {
                    graphic.destroy();
                } else {
                    newProjectileGraphics.push(graphic);
                }
            }
            projectileGraphics = newProjectileGraphics;

            for (let graphic of update.projectiles) {
                if (!projectileGraphics.includes(graphic)) {
                    projectileGraphics.push(graphic);
                    this.app.stage.addChild(graphic);
                }
            }

            if (update.newPlayers) {
                this.app.stage.removeChild(...playerGraphics);
                this.app.stage.addChild(...update.players);
                playerGraphics = update.players;
            }

            if (update.newMap) {
                mapGraphics.forEach(mg => mg.destroy());
                this.app.stage.addChild(...update.map);
                mapGraphics = update.map;
            }
        });

        communication.gameinfoUpdates.subscribe(update => {
            switch (update.command) {
                case GameinfoCommand.NEW_ROUND:
                    this.gameMessagesSubject.next({
                        clear: true,
                        message: ''
                    });
                    break;
                case GameinfoCommand.NEW_PLAYER:
                    this.gameMessagesSubject.next({
                        clear: false,
                        message: `Player ${update.params.nickname} joined the game!`
                    });
                    break;
                case GameinfoCommand.END_ROUND:
                    const roundWinner = this.game.resolveStatus(update.params);
                    this.gameMessagesSubject.next({
                        clear: false,
                        message: `${roundWinner.name} won the round!`
                    });
                    break;
                case GameinfoCommand.END_GAME:
                    const gameWinner = this.game.resolveStatus(update.params);
                    this.gameMessagesSubject.next({
                        clear: false,
                        message: `${gameWinner.name} won the round!`
                    });
                    break;
                case GameinfoCommand.SCOREBOARD_UPDATE:
                    update.params.forEach((status: { id: string, score: number }) => {
                        this.game.resolveStatus(status.id).score = status.score;
                    });
                    break;
            }
        });
    }

    public start() {
        this.game.startGame();
    }
}

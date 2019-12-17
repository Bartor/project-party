import {Application} from 'pixi.js';
import {Game} from "./game_flow/Game";
import DisplayObject = PIXI.DisplayObject;

export class ProjectParty {
    private app: Application;

    constructor(container: HTMLElement, game: Game) {
        const biggerDimension = Math.max(container.clientHeight, container.clientWidth);

        this.app = new Application({
            antialias: true,
            height: biggerDimension,
            width: biggerDimension
        });
        container.appendChild(this.app.view);

        let mapGraphics: DisplayObject[] = [];
        let playerGraphics: DisplayObject[] = [];
        let projectileGraphics: DisplayObject[] = [];

        game.graphicsUpdates.subscribe(update => {
            let newProjectileGraphics = [];
            for (let graphic of projectileGraphics) {
                if (!update.projectiles.includes(graphic)) {
                    this.app.stage.removeChild(graphic);
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
                this.app.stage.removeChild(...mapGraphics);
                this.app.stage.addChild(...update.map);
                mapGraphics = update.map;
            }
        });
    }
}

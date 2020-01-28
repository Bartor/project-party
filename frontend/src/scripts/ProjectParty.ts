import {Application} from 'pixi.js';
import {Game} from "./game_flow/Game";
import DisplayObject = PIXI.DisplayObject;
import {DOTS_PER_DIMENSION, PLAYER_SIZE} from "../config/config";

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

        game.playerSize = (PLAYER_SIZE/DOTS_PER_DIMENSION)*biggerDimension;
        game.communicationService.resizeDimensions.height = biggerDimension;
        game.communicationService.resizeDimensions.width = biggerDimension;

        let mapGraphics: DisplayObject[] = [];
        let playerGraphics: DisplayObject[] = [];
        let projectileGraphics: DisplayObject[] = [];

        game.graphicsUpdates.subscribe(update => {
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
                playerGraphics.forEach(pg => pg.destroy());
                this.app.stage.addChild(...update.players);
                playerGraphics = update.players;
            }

            if (update.newMap) {
                mapGraphics.forEach(mg => mg.destroy());
                this.app.stage.addChild(...update.map);
                mapGraphics = update.map;
            }
        });
    }
}

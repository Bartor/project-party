import {Application} from 'pixi.js';
import {Game} from "./game_flow/Game";

export class ProjectParty {
    private app: Application;

    constructor(container: HTMLElement, game: Game) {
        this.app = new Application({
            antialias: true
        });
        container.appendChild(this.app.view);

        game.graphicsUpdates.subscribe(graphics => {
            this.app.stage.removeChild(...this.app.stage.children);
            this.app.stage.addChild(...graphics);
        });
    }
}
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
            for (let child of this.app.stage.children) {
                if (!graphics.includes(child)) {
                    this.app.stage.removeChild(child);
                }
            }

            for (let obj of graphics) {
                if (!this.app.stage.children.includes(obj)) {
                    this.app.stage.addChild(obj);
                }
            }
        });
    }
}
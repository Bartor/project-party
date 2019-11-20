import {Application} from 'pixi.js';
import {Player} from "./game_objects/player/Player";
import {Game} from "./game_flow/Game";

export class ProjectParty {
    private app: Application;

    constructor(container: HTMLElement, game: Game) {
        this.app = new Application({
            antialias: true
        });
        container.appendChild(this.app.view);
    }

    public drawLoop() {

    }
}
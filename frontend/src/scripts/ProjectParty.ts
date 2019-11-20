import {Application} from 'pixi.js';
import {Player} from "./game_objects/player/Player";

export class ProjectParty {
    private app: Application;

    constructor(container: HTMLElement) {
        this.app = new Application({
            antialias: true
        });
        container.appendChild(this.app.view);
    }

    addPlayer(player: Player) {
        this.app.stage.addChild(player.getGraphics());
    }
}
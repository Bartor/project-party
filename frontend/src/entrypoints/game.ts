import '../styles/game.scss';
import '../styles/main.scss';

import {ProjectParty} from "../scripts/ProjectParty";
import {Game} from "../scripts/game_flow/Game";
import {GameCommunication} from "../scripts/communication/GameCommunication.class";
import {config} from "../config/config";

window.addEventListener('load', () => {
    const createGameButton = document.getElementById('create');

    createGameButton.addEventListener('click', () => {
       startGame();
    });
});


function startGame() {
    const container = document.getElementById('container');

    const communication = new GameCommunication(config.gameInfoEndpoint, config.screenEndpoint);
    const game = new Game(communication);
    const projectParty = new ProjectParty(container, game);
}

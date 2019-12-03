import {Player} from "../scripts/game_objects/player/Player";

import '../styles/game.scss';
import {ProjectParty} from "../scripts/ProjectParty";
import {Game} from "../scripts/game_flow/Game";
import {GameCommunication} from "../scripts/communication/GameCommunication.class";
import {config} from "../config/config";

window.addEventListener('load', () => {
    //mocked service
    const communication = new GameCommunication(config.screenEndpoint);
    setTimeout(() => {
        communication.simulateNewRound(['0']);
    }, 1000);
    const game = new Game(communication);
    game.addPlayer('0', new Player(0xffffff, 10).toRotatedPosition({position: {x: 200, y: 200}, rotation: 200}));
    const container = document.getElementById('container');
    const projectParty = new ProjectParty(container, game);
});

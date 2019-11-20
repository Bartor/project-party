import {ProjectParty} from "./scripts/ProjectParty";
import {Player} from "./scripts/game_objects/player/Player";

import './styles/index';

window.addEventListener('load', () => {
    const container = document.getElementById('container');
    const game = new ProjectParty(container);
    const player = new Player('xD', 0x0070ff, 10);
    game.addPlayer(player.toPosition(200, 200));
});
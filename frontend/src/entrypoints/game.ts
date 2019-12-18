import '../styles/game.scss';
import '../styles/main.scss';
import '../helper/notifications/default.scss';

import {ProjectParty} from "../scripts/ProjectParty";
import {Game} from "../scripts/game_flow/Game";
import {GameCommunication} from "../scripts/communication/GameCommunication.class";
import {ENDPOINTS} from "../config/config";
import {GameinfoCommand} from "../scripts/shared/enums/GameinfoCommand.enum";
import {NotificationManager} from "../helper/notifications/NotificationManager";

window.addEventListener('load', () => {
    const createGameButton = document.getElementById('create');

    createGameButton.addEventListener('click', () => {
       startGame();
    });
});

function startGame() {
    const createGameButton = document.getElementById('create');
    const notificationContainer = document.getElementById('notifications');
    const container = document.getElementById('container');
    const startGameButton = document.getElementById('start');

    const notifications = new NotificationManager(notificationContainer);

    const communication = new GameCommunication(ENDPOINTS.gameInfoEndpoint, ENDPOINTS.screenEndpoint);
    const game = new Game(communication);
    const projectParty = new ProjectParty(container, game);

    startGameButton.addEventListener('click', () => {
       game.startGame();
    });

    communication.gameinfoUpdates.subscribe(update => {
       switch (update.command) {
           case GameinfoCommand.NEW_GAME:
               notifications.notify(`Create a game with id ${update.params}`);
               createGameButton.style.display = 'none';
               break;
           case GameinfoCommand.NEW_PLAYER:
               notifications.notify(`A player with id ${update.params} joined the game`);
               break;
           case GameinfoCommand.NEW_ROUND:
               notifications.notify('New round started');
               break;
       }
    });
}

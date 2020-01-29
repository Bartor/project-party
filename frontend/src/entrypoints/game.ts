import '../styles/game.scss';
import '../styles/main.scss';
import '../helper/notifications/default.scss';

import {ProjectParty} from "../scripts/ProjectParty";
import {Game} from "../scripts/game_flow/Game";
import {GameCommunication} from "../scripts/communication/GameCommunication.class";
import {ENDPOINTS} from "../config/config";
import {NotificationManager} from "../helper/notifications/NotificationManager";
import {PlayerStatus} from "../scripts/shared/interfaces/PlayerStatus.interface";

let createGameButton: HTMLButtonElement;
let startGameButton: HTMLButtonElement;

window.addEventListener('load', () => {
    createGameButton = document.getElementById('create') as HTMLButtonElement;
    startGameButton = document.getElementById('start') as HTMLButtonElement;

    createGameButton.addEventListener('click', () => {
        startGame();
    });
});

function startGame() {
    const notificationContainer = document.getElementById('notifications');
    const container = document.getElementById('container');

    const notifications = new NotificationManager(notificationContainer);

    const communication = new GameCommunication(ENDPOINTS.gameInfoEndpoint, ENDPOINTS.screenEndpoint);
    const game = new Game(communication);

    communication.connect().then(gameId => {
        const projectParty = new ProjectParty(container, game);
        createGameButton.disabled = true;
        createGameButton.textContent = `Game: ${gameId}`;
        notifications.notify(`Created a game ${gameId}`);

        game.gameStatus.subscribe(updateScoreboard);

        startGameButton.addEventListener('click', () => {
            game.startGame();
        });
    }).catch(err => {
        notifications.notify(`An error occurred: ${err}`);
    });
}

function updateScoreboard(statuses: PlayerStatus[]) {
    const scoreBoard = document.getElementById('scoreboard');
    while (scoreBoard.firstChild) scoreBoard.removeChild(scoreBoard.firstChild);

    for (let status of statuses) {
        const tr = document.createElement('tr');

        const colorTd = document.createElement('td');
        const nameTd = document.createElement('td');
        const scoreTd = document.createElement('td');

        colorTd.textContent = String.fromCharCode(0x2b24); // ⬤
        colorTd.style.color = `#${status.color}`;
        nameTd.textContent = status.name;
        scoreTd.textContent = status.score.toString();

        tr.append(colorTd, nameTd, scoreTd);
        scoreBoard.append(tr);
    }
}

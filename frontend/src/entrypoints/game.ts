import '../styles/game.scss';
import '../styles/main.scss';

import {ProjectParty} from "../scripts/ProjectParty";
import {GameCommunication} from "../scripts/communication/GameCommunication.class";
import {ENDPOINTS} from "../config/config";
import {NotificationManager} from "../helper/notifications/NotificationManager";
import {PlayerStatus} from "../scripts/shared/interfaces/PlayerStatus.interface";
import {PlayerState} from "../scripts/shared/enums/PlayerState.enum";

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


    communication.connect().then(gameId => {
        const projectParty = new ProjectParty(container, communication);
        createGameButton.disabled = true;
        createGameButton.textContent = `Game: ${gameId}`;
        let currentNotification = notifications.notify(`Created a game ${gameId}`);

        projectParty.scoreboardUpdates.subscribe(updateScoreboard);

        projectParty.gameMessages.subscribe(msg => {
            if (currentNotification) currentNotification();
            currentNotification = msg.clear ? null : notifications.notify(msg.message);
        });

        startGameButton.addEventListener('click', () => {
            projectParty.start();
            startGameButton.style.transform = 'scale(0)';
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
        if (status.state === PlayerState.DEAD) {
            colorTd.style.filter = 'alpha(0.2)';
        }

        colorTd.style.color = `#${status.color}`;
        nameTd.textContent = status.name;
        scoreTd.textContent = status.score.toString();

        tr.append(colorTd, nameTd, scoreTd);
        scoreBoard.append(tr);
    }
}

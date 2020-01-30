import '../styles/main.scss';
import '../styles/controller.scss';

import {NotificationManager} from "../helper/notifications/NotificationManager";
import {Controller} from "../scripts/Controller";
import {ControllerCommunication} from "../scripts/communication/ControllerCommunication.class";
import {ENDPOINTS} from "../config/config";

// programically prevent pinch zooming
window.addEventListener('touchstart', event => {
    if (event.touches.length > 1) event.preventDefault();
});

let notifications: NotificationManager;

window.addEventListener('load', () => {
    const notificationContainer = document.getElementById('notifications');
    const button = document.getElementById('join-button') as HTMLButtonElement;
    const gameIdInput = document.getElementById('game-id-input') as HTMLInputElement;
    const nickInput = document.getElementById('nick-input') as HTMLInputElement;

    notifications = new NotificationManager(notificationContainer);

    button.addEventListener('click', () => {
        let id = gameIdInput.value;
        let nickname = nickInput.value;
        if (!isNaN(Number(id)) && id !== '') {
            joinGame(Number(id), nickname);
        } else {
            notifications.notify(`Id is incorrect`);
        }
    });
});

function joinGame(gameId: number, nick: string) {
    const container = document.querySelector('main');

    const communication = new ControllerCommunication(ENDPOINTS.controllerEndpoint + `?id=${gameId}&nick=${nick}`, 50);
    communication.connect().then(() => {
        notifications.notify(`Joining game ${gameId}`);
        while (container.firstChild) container.removeChild(container.firstChild);
        const controller = new Controller(container, communication);
        controller.drawLoop();
    }).catch(err => {
        notifications.notify(`Connection error: ${err}`);
    });
}

import '../styles/main.scss';
import '../styles/controller.scss';

import '../helper/notifications/default.scss';
import {NotificationManager} from "../helper/notifications/NotificationManager";
import {Controller} from "../scripts/Controller";
import {ControllerCommunication} from "../scripts/communication/ControllerCommunication.class";
import {config} from "../config/config";

// programically prevent pinch zooming
window.addEventListener('touchstart', event => {
    if (event.touches.length > 1) event.preventDefault();
});

window.addEventListener('load', () => {
    const notificationContainer = document.getElementById('notifications');
    const button = document.getElementById('join-button') as HTMLButtonElement;
    const gameIdInput = document.getElementById('game-id-input') as HTMLInputElement;

    const notifications = new NotificationManager(notificationContainer);

    button.addEventListener('click', () => {
        let id = gameIdInput.value;
        if (!isNaN(Number(id)) && id !== '') {
            notifications.notify(`Joining game ${id}`);
            // error handling isn't really present, id has to be correct
            joinGame(Number(id));
        } else {
            notifications.notify(`Id is incorrect`);
        }
    });
});

function joinGame(gameId: number) {
    const container = document.querySelector('main');

    while (container.firstChild) container.removeChild(container.firstChild);

    const communication = new ControllerCommunication(config.controllerEndpoint + `?id=${gameId}`, 30);
    const controller = new Controller(container, communication);
    controller.drawLoop();
}

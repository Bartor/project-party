import '../styles/controller.scss';
import {Controller} from "../scripts/Controller";
import {ControllerCommunication} from "../scripts/communication/ControllerCommunication.class";
import {config} from "../config/config";

// programically prevent pinch zooming
window.addEventListener('touchstart', event => {
    if (event.touches.length > 1) event.preventDefault();
});

window.addEventListener('load', () => {
    const container = document.querySelector('main');

    const communication = new ControllerCommunication(config.controllerEndpoint, 1);
    const controller = new Controller(container, communication);
    controller.drawLoop();
});

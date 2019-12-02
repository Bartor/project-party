import '../styles/controller.scss';
import {Controller} from "../scripts/Controller";
import {ControllerCommunication} from "../scripts/communication/ControllerCommunication.class";

// programically prevent pinch zooming
window.addEventListener('touchstart', event => {
    if (event.touches.length > 1) event.preventDefault();
});

window.addEventListener('load', () => {
    const container = document.querySelector('main');

    const communication = new ControllerCommunication('123.123.123.123', 3000, 20);
    const controller = new Controller(container, communication);
    controller.drawLoop();
});

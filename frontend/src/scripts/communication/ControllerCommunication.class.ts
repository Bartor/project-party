import {WebSocketSubject} from "rxjs/webSocket";
import Timeout = NodeJS.Timeout;

export class ControllerCommunication {
    private websocket: WebSocketSubject<string>;
    private ticker: Timeout;
    private recentAction = {
        move: {speed: -1, direction: -1},
        shoot: {direction: -1}
    };

    constructor(address: string, port: number, private tickrate: number) {
        this.websocket = new WebSocketSubject(`${address}:${port}`);
        this.ticker = setInterval(() => {
            this.sendRecentData();
        }, tickrate);
    }

    private createDataPacket(): string {
        let moveString = this.recentAction.move.speed !== -1 ? `${this.recentAction.move.speed}:${this.recentAction.move.direction}` : '';
        let shootString = this.recentAction.shoot.direction !== -1 ? this.recentAction.shoot.direction.toString() : '';
        let timestamp = Date.now().toString();
        return `${timestamp}/${moveString}/${shootString}`;
    }

    private sendRecentData() {
        let data = this.createDataPacket();
        this.websocket.next(data);
        this.recentAction.move.speed = -1;
        this.recentAction.move.direction = -1;
        this.recentAction.shoot.direction = -1;
    }

    public move(direction: number, speed: number) {
        if (Math.floor(direction) !== direction) throw 'Direction has to be an integer';
        if (direction > 360 || direction < 0) throw 'Direction has to be between 0 and 360';
        if (speed < 0 || speed > 1) throw 'Speed has to be between 0 and 1';
        this.recentAction.move.speed = speed;
        this.recentAction.move.direction = direction;
    }

    public shoot(direction: number) {
        if (Math.floor(direction) !== direction) throw 'Direction has to be an integer';
        if (direction > 360 || direction < 0) throw 'Direction has to be between 0 and 360';
        this.recentAction.shoot.direction = direction;
    }
}

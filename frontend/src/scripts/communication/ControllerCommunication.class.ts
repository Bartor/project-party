import {WebSocketSubject} from "rxjs/webSocket";
import Timeout = NodeJS.Timeout;

export class ControllerCommunication {
    private websocket: WebSocketSubject<string>;
    private readonly ticker: Timeout;
    private recentAction = {
        move: {speed: -1, direction: -1},
        shoot: {direction: -1}
    };

    constructor(address: string, private tickrate: number) {
        this.websocket = new WebSocketSubject({
            url: address,
            serializer: value => value
        });
        this.ticker = setInterval(() => {
            this.sendAndReset();
        }, 1000 / tickrate);
    }

    public connect(): Promise<string> {
        return new Promise((resolve, reject) => {
            this.websocket.subscribe(msg => {
                resolve(msg);
            }, err => {
                clearInterval(this.ticker);
                this.websocket.unsubscribe();
                reject(err);
            });
        });
    }

    private createDataPacket(): string {
        if (this.recentAction.move.speed === -1 && this.recentAction.shoot.direction === -1) return '';

        let moveString = this.recentAction.move.speed !== -1 ? `${this.recentAction.move.speed}:${this.recentAction.move.direction}` : '';
        let shootString = this.recentAction.shoot.direction !== -1 ? this.recentAction.shoot.direction.toString() : '';
        let timestamp = Date.now().toString();
        return `${timestamp}/${moveString}/${shootString}`;
    }

    private sendAndReset() {
        const packet = this.createDataPacket();
        if (packet !== '') {
            this.websocket.next(packet);
            this.recentAction.move.speed = -1;
            this.recentAction.move.direction = -1;
            this.recentAction.shoot.direction = -1;
        }
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

import {WebSocketSubject} from "rxjs/webSocket";
import Timeout = NodeJS.Timeout;

/**
 * Communication and parsing messages sent to backend.
 */
export class ControllerCommunication {
    private websocket: WebSocketSubject<string>;
    private readonly ticker: Timeout;
    private recentAction = {
        move: {speed: -1, direction: -1},
        shoot: {direction: -1}
    };

    /**
     * Create a new communication instance.
     * @param address WebSocket address (with all parameters).
     * @param tickrate How many times in a second should the controller update.
     */
    constructor(address: string, private tickrate: number) {
        this.websocket = new WebSocketSubject({
            url: address,
            serializer: value => value,
            deserializer: value => value.toString()
        });
        this.ticker = setInterval(() => {
            this.sendAndReset();
        }, 1000 / tickrate);
    }

    /**
     * Establish and test a connection.
     * @return A promise; rejects on a connection error, resolves if the connection was successful.
     */
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

    /**
     * Create a single packet interpretable by the server, ready to be sent.
     * @return A string which is the packet.
     */
    private createDataPacket(): string {
        if (this.recentAction.move.speed === -1 && this.recentAction.shoot.direction === -1) return '';

        let moveString = this.recentAction.move.speed !== -1 ? `${this.recentAction.move.speed}:${this.recentAction.move.direction}` : '';
        let shootString = this.recentAction.shoot.direction !== -1 ? this.recentAction.shoot.direction.toString() : '';
        let timestamp = Date.now().toString();
        return `${timestamp}/${moveString}/${shootString}`;
    }

    /**
     * Send the current packet and reset last positions.
     */
    private sendAndReset() {
        const packet = this.createDataPacket();
        if (packet !== '') {
            this.websocket.next(packet);
            this.recentAction.move.speed = -1;
            this.recentAction.move.direction = -1;
            this.recentAction.shoot.direction = -1;
        }
    }

    /**
     * Register a movement as a last action from the user.
     * @param direction Direction of movement; integer from [0, 360].
     * @param speed Speed of the movement; real from [0, 1].
     */
    public move(direction: number, speed: number) {
        if (Math.floor(direction) !== direction) throw 'Direction has to be an integer';
        if (direction > 360 || direction < 0) throw 'Direction has to be between 0 and 360';
        if (speed < 0 || speed > 1) throw 'Speed has to be between 0 and 1';
        this.recentAction.move.speed = speed;
        this.recentAction.move.direction = direction;
    }

    /**
     * Register a shot as a last action from the user.
     * @param direction Direction of the shot; integer from [0, 360].
     */
    public shoot(direction: number) {
        if (Math.floor(direction) !== direction) throw 'Direction has to be an integer';
        if (direction > 360 || direction < 0) throw 'Direction has to be between 0 and 360';
        this.recentAction.shoot.direction = direction;
    }
}

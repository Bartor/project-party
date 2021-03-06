import {ControllerCommunication} from "./communication/ControllerCommunication.class";
import {Point} from "./shared/interfaces/Point.interface";

/**
 * A class which displays the controls on the mobile.
 */
export class Controller {
    private readonly canvas: HTMLCanvasElement;
    private readonly context: CanvasRenderingContext2D;

    private centerMove: { x: number, y: number };
    private centerShoot: { x: number, y: number };
    private radius: number;

    private centerMoveTouch = {x: 0, y: 0};
    private centerShootTouch = {x: 0, y: 0};

    private pointers: (PointerEvent & { controlType: string })[] = [];

    /**
     * Create a new instance.
     * @param container Where the canvas should be drawn.
     * @param communication A communication service to use.
     */
    constructor(container: HTMLElement, private communication: ControllerCommunication) {
        this.canvas = document.createElement('canvas');
        container.append(this.canvas);

        this.context = this.canvas.getContext('2d');
        this.evalDimensions(container);

        window.addEventListener('resize', () => this.evalDimensions(container));

        this.canvas.addEventListener('touchmove', event => event.preventDefault());
        this.canvas.addEventListener('pointerdown', event => {
            event.preventDefault();
            let idx = this.pointers.findIndex(e => e.pointerId === event.pointerId);
            if (idx === -1) {
                this.pointers.push(Object.assign(event, {controlType: null}));
            } else {
                this.pointers[idx] = Object.assign(event, {controlType: this.pointers[idx].controlType});
            }
            this.handleInput();
        });
        this.canvas.addEventListener('pointerup', event => {
            event.preventDefault();
            let idx = this.pointers.findIndex(e => e.pointerId === event.pointerId);
            if (idx !== 1) this.pointers.splice(idx, 1);
            this.handleInput();
        });
        this.canvas.addEventListener('pointerout', event => {
            let idx = this.pointers.findIndex(e => e.pointerId === event.pointerId);
            if (idx !== -1) this.pointers.splice(idx, 1);
            this.handleInput();
        });
        this.canvas.addEventListener('pointermove', event => {
            event.preventDefault();
            let idx = this.pointers.findIndex(e => e.pointerId === event.pointerId);
            if (idx !== -1) this.pointers[idx] = Object.assign(event, {controlType: this.pointers[idx].controlType});
            this.handleInput();
        });
    }

    /**
     * Used when resizing the window.
     * @param container A new container of the canvas.
     */
    private evalDimensions(container: HTMLElement) {
        this.canvas.height = container.clientHeight;
        this.canvas.width = container.clientWidth;

        let heightFlag = this.canvas.height > this.canvas.width / 2;
        this.radius = heightFlag ? this.canvas.width / 6 : this.canvas.height / 3;
        this.centerMove = {
            x: this.radius * 1.5,
            y: this.canvas.height / 2
        };
        this.centerShoot = {
            x: this.canvas.width - this.radius * 1.5,
            y: this.canvas.height / 2
        };
        this.centerShootTouch = {...this.centerShoot};
        this.centerMoveTouch = {...this.centerMove};
    }

    /**
     * Used as a callback for move events. Calculates the corresponding
     * input and updates it in state.
     */
    private handleInput() {
        let shoot = false, move = false;
        for (let pointerEvent of this.pointers) {
            let toShoot = this.dist(pointerEvent, this.centerShoot);
            let toMove = this.dist(pointerEvent, this.centerMove);

            if (pointerEvent.controlType === 'shoot') {
                this.centerShootTouch.x = pointerEvent.x;
                this.centerShootTouch.y = pointerEvent.y;
                shoot = true;
            } else if (pointerEvent.controlType === 'move') {
                this.centerMoveTouch.x = pointerEvent.x;
                this.centerMoveTouch.y = pointerEvent.y;
                move = true;
            } else {
                if (toShoot < toMove) {
                    if (!shoot) {
                        pointerEvent.controlType = 'shoot';
                        this.centerShootTouch.x = pointerEvent.x;
                        this.centerShootTouch.y = pointerEvent.y;
                        shoot = true;
                    }
                } else {
                    if (!move) {
                        pointerEvent.controlType = 'move';
                        this.centerMoveTouch.x = pointerEvent.x;
                        this.centerMoveTouch.y = pointerEvent.y;
                        move = true;
                    }
                }
            }

            if (move && shoot) break;
        }
        if (!shoot) this.centerShootTouch = {...this.centerShoot};
        if (!move) this.centerMoveTouch = {...this.centerMove};
    }

    /**
     * Send current controller state to the communication service.
     */
    private communicate() {
        let moveDist = this.dist(this.centerMove, this.centerMoveTouch);
        if (moveDist > 0) {
            let angle = this.angle(this.centerMove, this.centerMoveTouch);
            let normalizedMoveDist = moveDist / this.radius > 1 ? 1 : moveDist / this.radius;
            this.communication.move(angle, normalizedMoveDist);
        }
        let shootDist = this.dist(this.centerShoot, this.centerShootTouch);
        if (shootDist > this.radius / 2) {
            let angle = this.angle(this.centerShoot, this.centerShootTouch);
            this.communication.shoot(angle);
        }
    }

    /**
     * Start drawing the controls on the canvas.
     */
    drawLoop() {
        this.communicate();
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.context.beginPath();
        this.context.fillStyle = '#202020';
        this.context.arc(this.centerMove.x, this.centerMove.y, this.radius, 0, 2 * Math.PI); // moving circle
        this.context.arc(this.centerShoot.x, this.centerShoot.y, this.radius, 0, 2 * Math.PI); //shooting outer circle
        this.context.fill();

        this.context.beginPath();
        this.context.fillStyle = '#181818';
        this.context.arc(this.centerShoot.x, this.centerShoot.y, this.radius / 2, 0, 2 * Math.PI); // shooting inner
        // circle
        this.context.fill();

        this.context.beginPath();
        this.context.fillStyle = '#323232';
        this.context.arc(this.centerMoveTouch.x, this.centerMoveTouch.y, this.radius / 4, 0, 2 * Math.PI); // moving pad
        this.context.arc(this.centerShootTouch.x, this.centerShootTouch.y, this.radius / 4, 0, 2 * Math.PI); // shooting pad
        this.context.fill();

        requestAnimationFrame(() => this.drawLoop());
    }

    /**
     * Distance between two points.
     */
    private dist(a: Point, b: Point) {
        return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
    }

    /**
     * Angle between two points.
     */
    private angle(pivot: Point, point: Point) {
        let sin = Math.abs(point.y - pivot.y) / this.dist(pivot, point);
        let calculatedAngle: number;

        if (pivot.x < point.x) {
            if (pivot.y > point.y) {
                calculatedAngle = 2 * Math.PI - Math.asin(sin);
            } else {
                calculatedAngle = Math.asin(sin);
            }
        } else {
            if (pivot.y > point.y) {
                calculatedAngle = Math.PI + Math.asin(sin);
            } else {
                calculatedAngle = Math.PI - Math.asin(sin);
            }
        }

        return Math.round(calculatedAngle * 180 / Math.PI);
    }
}

import {PlayerState} from "../../shared/enums/PlayerState.enum";
import {MovableGraphics} from "../../shared/abstract/MovableGraphics.asbstract.class";

export class Player extends MovableGraphics {
    private _state = PlayerState.ALIVE;
    public get state() { return this._state; }
    public set state(state: PlayerState) {
        switch (state) {
            case PlayerState.SCHRODINGER:
            case PlayerState.ALIVE:
                this.graphics.alpha = 1;
                break;
            case PlayerState.DEAD:
                this.graphics.alpha = 0.2;
                break;
        }
        this._state = state;
    }

    constructor(color: number, size: number) {
        super();
        this.angleFixup = Math.PI * 3 / 4;

        this.graphics.beginFill(color);
        this.graphics.drawPolygon([
           -1/4*size, -1/2*size,
           1/4*size, -1/2*size,
           1/2*size, -1/4*size,
           1/2*size, 1/4*size,
           1/4*size, 1/2*size,
           -1/4*size, 1/2*size,
           -1/2*size, 1/4*size,
           -1/2*size, -1/4*size
        ]);
        this.graphics.endFill();
    }
}

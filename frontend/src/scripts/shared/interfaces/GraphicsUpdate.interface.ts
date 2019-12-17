import DisplayObject = PIXI.DisplayObject;

export interface GraphicsUpdate {
    newPlayers: boolean,
    newMap: boolean,
    map: DisplayObject[],
    projectiles: DisplayObject[],
    players: DisplayObject[]
}

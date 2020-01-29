import DisplayObject = PIXI.DisplayObject;

/**
 * Information about changing graphics.
 */
export interface GraphicsUpdate {
    /**
     * If any new players are included.
     */
    newPlayers: boolean,
    /**
     * If map has changed.
     */
    newMap: boolean,
    map: DisplayObject[],
    projectiles: DisplayObject[],
    players: DisplayObject[]
}

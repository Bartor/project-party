/**
 * States of the player. SCHRODINGER is used when
 * we're in the middle of the iteration and we're still not
 * sure if the player is dead or alive.
 */
export enum PlayerState {
    SCHRODINGER = 0,
    ALIVE = 1,
    DEAD = 2,
}

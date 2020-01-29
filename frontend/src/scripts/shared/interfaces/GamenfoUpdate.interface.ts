import {GameinfoCommand} from "../enums/GameinfoCommand.enum";

/**
 * A single "slow" update about rounds, players etc.
 */
export interface GameinfoUpdate {
    command: GameinfoCommand,
    params: any
}

import {GameinfoCommand} from "../enums/GameinfoCommand.enum";

export interface GameinfoUpdate {
    command: GameinfoCommand,
    params: any
}

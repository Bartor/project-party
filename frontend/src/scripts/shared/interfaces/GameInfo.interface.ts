import {GameinfoCommand} from "../enums/GameinfoCommand.enum";

export interface GameInfo {
    command: GameinfoCommand,
    params: any
}

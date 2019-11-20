import {Player} from "./scripts/game_objects/player/Player";

import './styles/index';
import {ProjectParty} from "./scripts/ProjectParty";
import {Game} from "./scripts/game_flow/Game";
import {Observable, Subject} from "rxjs";
import {GameplayUpdate} from "./scripts/shared/interfaces/GameplayUpdate.interface";
import {RoundState} from "./scripts/shared/interfaces/RoundState.interface";
import {RotatedPosition} from "./scripts/shared/interfaces/RotatedPosition.interface";

const mockRoundSubject = new Subject<RoundState>();
setTimeout(() => {
    let pos = new Map<string, RotatedPosition>();
    pos.set('test', {position: {x: 600, y: 400}, rotation: 300});
    pos.set('xD', {position: {x: 300, y: 40}, rotation: 90});
    mockRoundSubject.next({
        map: [
            [{x: 10, y: 10}, {x: 30, y: 50}, {x: 40, y: 60}, {x: 80, y: 40}, {x: 50, y: 20}],
            [{x: 500, y: 200}, {y: 300, x: 100}, {x: 60, y: 200}]
        ],
        playerPositions: pos
    });
}, 1000);

window.addEventListener('load', () => {
    //mocked service
    const game = new Game({
        gameStateUpdates: function () {
            return new Observable<GameplayUpdate>();
        }, roundUpdates: function () {
            return mockRoundSubject.asObservable();
        }
    });
    game.addPlayer('test', new Player(0xffffff, 10).toRotatedPosition({position: {x: 200, y: 200}, rotation: 200}));
    game.addPlayer('xD', new Player(0xffffff, 10).toRotatedPosition({position: {x: 200, y: 200}, rotation: 200}));
    const container = document.getElementById('container');
    const projectParty = new ProjectParty(container, game);
});
const WEBSOCKET_ADDRESS = 'other.bartor.net';
const WEBSOCKET_PORT = 8080;
const WEBSOCKET_ENDPOINTS: {[endpoint: string]: string} = {
    CONTROLLER: 'controllerWs',
    SCREEN: 'screenWs',
    GAME_INFO: 'gameInfoWs'
};

function createWsUrl(endpoint: string) {
    return `ws://${WEBSOCKET_ADDRESS}:${WEBSOCKET_PORT}/${WEBSOCKET_ENDPOINTS[endpoint]}`
}

export const ENDPOINTS = {
    controllerEndpoint: createWsUrl('CONTROLLER'),
    screenEndpoint: createWsUrl('SCREEN'),
    gameInfoEndpoint: createWsUrl('GAME_INFO')
};

class Color {
    constructor(private value: number) {
    }

    public valueOf() {
        return this.value;
    }

    public toString() {
        return this.value.toString(16).padStart(6, '0');
    }
}

export const PLAYER_COLORS = [
    new Color(0x007EA7),
    new Color(0xF1D302),
    new Color(0xC1292E),
    new Color(0xFDFFFC),
    new Color(0x78D5D7),
    new Color(0x136F63)
];

export const DOTS_PER_DIMENSION = 800;
export const PLAYER_SIZE = 20;

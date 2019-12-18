const WEBSOCKET_ADDRESS = 'localhost';
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

export const PLAYER_COLORS = [
    0x007EA7,
    0xF1D302,
    0xC1292E,
    0xFDFFFC,
    0x78D5D7,
    0x136F63
];

export const DOTS_PER_DIMENSION = 800;
export const PLAYER_SIZE = 20;
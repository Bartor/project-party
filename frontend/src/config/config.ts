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

export const config = {
    controllerEndpoint: createWsUrl('CONTROLLER'),
    screenEndpoint: createWsUrl('SCREEN'),
    gameInfoEndpoint: createWsUrl('GAME_INFO')
};

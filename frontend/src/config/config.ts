const WEBSOCKET_ADDRESS = 'localhost';
const WEBSOCKET_PORT = 8080;
const WEBSOCKET_ENDPOINTS: {[endpoint: string]: string} = {
    CONTROLLER: 'controllerWs',
    SCREEN: 'screenWs'
};

function createWsUrl(endpoint: string) {
    return `ws://${WEBSOCKET_ADDRESS}:${WEBSOCKET_PORT}/${WEBSOCKET_ENDPOINTS[endpoint]}`
}

export const config = {
    controllerEndpoint: createWsUrl('CONTROLLER'),
    screenEndpoint: createWsUrl('SCREEN')
};

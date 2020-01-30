// const WEBSOCKET_ADDRESS = 'localhost'; // for possible future deployment
const WEBSOCKET_ADDRESS = window.location.host; // for current deployment
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
    new Color(0x567feb),
    new Color(0x8f0b5f),
    new Color(0xacfcad),
    new Color(0xffec6d),
    new Color(0x53034b),
    new Color(0x0a547b),
    new Color(0xff8686),
    new Color(0x278c7f),
    new Color(0xad6dea),
    new Color(0xfb4771),
    new Color(0xffa763),
    new Color(0x0ce7a7),
    new Color(0x9fb9ff),
    new Color(0xff4040),
    new Color(0xce186a),
    new Color(0xafafcf),
];

export const DOTS_PER_DIMENSION = 800;
export const PLAYER_SIZE = 20;

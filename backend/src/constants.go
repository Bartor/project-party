package main

import (
	"github.com/gorilla/websocket"
	"net/http"
	"time"
)

const (
	// Time allowed to write a message to the peer.
	writeWait = 10 * time.Second

	// Time allowed to read the next pong message from the peer.
	pongWait = 600 * time.Second

	// Send pings to peer with this period. Must be less than pongWait.
	pingPeriod = (pongWait * 9) / 10

	// Maximum message size allowed from peer.
	maxMessageSize = 512

	fastRefresh = 15000000
	slowRefresh = 100000000
	refresh = fastRefresh
	timeFactor = float64(refresh)/1000000000.0

	// GAME RELATED CONSTANTS
	// The speed at which the shot will travel
	globalShotSpeed = 110.0 / 800.0 * timeFactor

	// The speed at which players will walk
	globalMoveSpeed = 80.0 / 800.0 * timeFactor 
	slowDown = 3.5*globalMoveSpeed

	playerRadius = 0.015
	unitSize = 0.00125

	reloadTime = 300 * time.Millisecond
)

var (
	newline = []byte{'\n'}
	space   = []byte{' '}
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

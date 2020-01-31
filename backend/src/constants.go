// Copyright 2020 Project: Party. All rights Reserved

// The main package of the game
package main

import (
	"github.com/gorilla/websocket"
	"net/http"
	"time"
	"flag"
	"math/rand"
)

// Constants for socket creations
const (
	writeWait = 10 * time.Second // Time allowed to write a message to the peer
	pongWait = 600 * time.Second // Time allowed to read the next pong message from the peer
	pingPeriod = (pongWait * 9) / 10 // Send pings to peer with this period. Must be less than pongWait	
	maxMessageSize = 512 // Maximum message size allowed from peer.
)

// Constants for game events handling
const (
	fastRefresh = 15000000
	slowRefresh = 100000000
	refresh     = fastRefresh
	timeFactor  = float64(refresh) / 1000000000.0
)

// Constants to control the game flow
const (
	globalShotSpeed = 110.0 / 800.0 * timeFactor // The speed at which the shot will travel
	globalMoveSpeed = 80.0 / 800.0 * timeFactor // The speed at which players will walk
	slowDown        = 3.5 * globalMoveSpeed // The speed of drag

	playerRadius = 0.015 // Player size, only code-wise
	unitSize     = 0.00125 // Size of one on-screen pixel for game event calculations

	reloadTime     = 300 * time.Millisecond // Time between shots
	roundBreakTime = 3 * time.Second // Time between the next round starts
	maxRoundCount  = 5 // How many round are supposed to be played before the game end

	lastManStandingPrize = 4 // How many points the winner receiver for being
)

// Helpful declarations for websocket string creations
var (
	newline = []byte{'\n'}
	space   = []byte{' '}
)

// upgrader allows us to upgrade the websocket stats to handle our message sizes
var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// Stores the amounts of games that have been created so far
var currentId uint64 = 0

// addr holds the required address flags for websocket communication
var addr = flag.String("addr", ":8080", "http service address")

var rng = rand.New(rand.NewSource(time.Now().Unix()))
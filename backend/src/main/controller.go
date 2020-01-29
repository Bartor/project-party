// Copyright 2020 Project: Party. All rights Reserved

// The main package of the game
package main

import (
	"bytes"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/websocket"
)

// A middleman between the websocket connection of controller app and the game.
type Controller struct {
	game *Game
	nick string
	conn *websocket.Conn
}


// readPump pumps messages from the websocket connection to the game.
// The application runs readPump in a per-connection goroutine. The application
// ensures that there is at most one reader on a connection by executing all
// reads from this goroutine.
func (c *Controller) readPump() {
	defer func() {
		c.game.unregisterController <- c
		c.conn.Close()
	}()
	c.conn.SetReadLimit(maxMessageSize)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error { c.conn.SetReadDeadline(time.Now().Add(pongWait)); return nil })
	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}
		message = bytes.TrimSpace(bytes.Replace(message, newline, space, -1))
		c.game.controllerMessages <- &ControllerMessage{c, message}
	}
}

// Returns a new controller websocket based on the request received
func serveControllerWs(w http.ResponseWriter, r *http.Request, games []*Game) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	keys, ok := r.URL.Query()["id"]

	if !ok || len(keys) < 1 {
		conn.WriteMessage(websocket.TextMessage, []byte("Error: id is required"))
		conn.WriteMessage(websocket.CloseMessage, []byte{})
		return
	}

	gameId, err := strconv.ParseUint(keys[0], 10, 64)

	if err != nil {
		conn.WriteMessage(websocket.TextMessage, []byte("Error: id must be an integer"))
		conn.WriteMessage(websocket.CloseMessage, []byte{})
		return
	}

	keys, ok = r.URL.Query()["nick"]
	if !ok || len(keys) < 1 {
		conn.WriteMessage(websocket.TextMessage, []byte("Error: nick is required"))
		conn.WriteMessage(websocket.CloseMessage, []byte{})
		return
	}

	nick := keys[0]

	game := findGameById(gameId, games)

	if game == nil {
		conn.WriteMessage(websocket.TextMessage, []byte("Error: game with given id doesn't exist"))
		conn.WriteMessage(websocket.CloseMessage, []byte{})
		return
	}

	if !game.isNickAvailable(nick) {
		conn.WriteMessage(websocket.TextMessage, []byte("Error: nick is not available"))
		conn.WriteMessage(websocket.CloseMessage, []byte{})
		return
	}

	conn.WriteMessage(websocket.TextMessage, []byte("successful"))

	controller := &Controller{game: game, nick: nick, conn: conn}
	controller.game.registerController <- controller

	// Allow collection of memory referenced by the caller by doing all work in
	// new goroutines.
	go controller.readPump()
}

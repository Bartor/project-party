package main

import (
	"bytes"
	"log"
	"net/http"
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
//
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

func serveControllerWs(game *Game, nick string, w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	controller := &Controller{game: game, nick: nick, conn: conn}
	controller.game.registerController <- controller

	// Allow collection of memory referenced by the caller by doing all work in
	// new goroutines.
	go controller.readPump()
}

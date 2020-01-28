package projectparty

import (
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
)

// A middleman between the websocket connection for the game screen app and the game.
type GameInfo struct {
	game *Game

	conn *websocket.Conn

	input chan []byte
}

// writePump pumps messages from the game to the websocket connection.
//
// A goroutine running writePump is started for each connection. The
// application ensures that there is at most one writer to a connection by
// executing all writes from this goroutine.
func (s *GameInfo) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		s.game.unregisterGameInfo <- true
		s.conn.Close()
	}()
	for {
		select {
		case message, ok := <-s.input:
			s.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				// The game closed the channel.
				s.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := s.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			n := len(s.input)
			for i := 0; i < n; i++ {
				w.Write(newline)
				w.Write(<-s.input)
			}

			if err := w.Close(); err != nil {
				return
			}
		case <-ticker.C:
			s.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := s.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

func serveGameInfoWs(game *Game, w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	gameInfo := &GameInfo{game: game, conn: conn, input: make(chan []byte, 256)}
	gameInfo.game.registerGameInfo <- gameInfo

	// Allow collection of memory referenced by the caller by doing all work in
	// new goroutines.
	go gameInfo.writePump()
}

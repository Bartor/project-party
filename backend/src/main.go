package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
	"strconv"
)

var addr = flag.String("addr", ":8080", "http service address")

func main() {
	flag.Parse()
	games := make([]*Game, 0)

	http.HandleFunc("/screenWs", func(w http.ResponseWriter, r *http.Request) {
		keys, ok := r.URL.Query()["id"]

		if !ok || len(keys) < 1 {
			return
		}

		gameId, err := strconv.ParseUint(keys[0], 10, 64)

		if err != nil {
			return
		}

		game := findGameById(gameId, games)

		if game == nil {
			return
		}
		serveScreenWs(game, w, r)
	})

	http.HandleFunc("/controllerWs", func(w http.ResponseWriter, r *http.Request) {
		keys, ok := r.URL.Query()["id"]

		if !ok || len(keys) < 1 {
			return
		}

		gameId, err := strconv.ParseUint(keys[0], 10, 64)

		if err != nil {
			return
		}

		game := findGameById(gameId, games)

		if game == nil {
			return
		}
		serveControllerWs(game, w, r)
	})

	http.HandleFunc("/gameInfoWs", func(w http.ResponseWriter, r *http.Request) {
		game := newGame()
		games = append(games, game)
		go game.run()
		fmt.Println("created game with id ", game.id)
		serveGameInfoWs(game, w, r)
	})

	log.Println("app started")
	err := http.ListenAndServe(*addr, nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
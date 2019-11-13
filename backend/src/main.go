package main

import (
	"flag"
	"log"
	"net/http"
)

var addr = flag.String("addr", ":8080", "http service address")

func main() {
	flag.Parse()
	game := newGame()
	go game.run()

	http.HandleFunc("/screenWs", func(w http.ResponseWriter, r *http.Request) {
		serveScreenWs(game, w, r)
	})
	http.HandleFunc("/controllerWs", func(w http.ResponseWriter, r *http.Request) {
		serveControllerWs(game, w, r)
	})
	log.Println("app started")
	err := http.ListenAndServe(*addr, nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
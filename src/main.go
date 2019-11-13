package main

import (
	"flag"
	"log"
	"net/http"
)

var addr = flag.String("addr", ":8080", "http service address")

func serveHome(w http.ResponseWriter, r *http.Request) {
	log.Println(r.URL)
	if r.URL.Path != "/" {
		http.Error(w, "Not found", http.StatusNotFound)
		return
	}
	if r.Method != "GET" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	http.ServeFile(w, r, "home.html")
}

func main() {
	flag.Parse()
	game := newGame()
	go game.run()
	http.HandleFunc("/", serveHome)
	http.HandleFunc("/screenWs", func(w http.ResponseWriter, r *http.Request) {
		serveScreenWs(game, w, r)
	})
	http.HandleFunc("/controllerWs", func(w http.ResponseWriter, r *http.Request) {
		serveControllerWs(game, w, r)
	})
	err := http.ListenAndServe(*addr, nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
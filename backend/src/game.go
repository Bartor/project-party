package main

type Game struct {
	controllers map[*Controller]bool
	screen *Screen

	controllerMessages chan []byte

	register chan *Controller

	unregister chan *Controller
}

func newGame() *Game {
	return &Game{
		controllerMessages:  make(chan []byte),
		register:   make(chan *Controller),
		unregister: make(chan *Controller),
		controllers:    make(map[*Controller]bool),
	}
}

func (g *Game) run() {
	for {
		select {
		case controller := <-g.register:
			g.controllers[controller] = true
		case controller := <-g.unregister:
			if _, ok := g.controllers[controller]; ok {
				delete(g.controllers, controller)
			}
			// TODO: register screen
		case message := <-g.controllerMessages:
			// TODO: handle controller messages
			select {
			case g.screen.input <- message:
			default:
				close(g.screen.input)
			}
		}
	}
}
package main

type Game struct {
	controllers map[*Controller]bool
	screen *Screen

	controllerMessages chan []byte

	register chan *Controller
	unregister chan *Controller

	registerScreen chan *Screen
	unregisterScreen chan bool
}

func newGame() *Game {
	return &Game{
		controllers:    make(map[*Controller]bool),
		controllerMessages:  make(chan []byte),
		register:   make(chan *Controller),
		unregister: make(chan *Controller),
		registerScreen:   make(chan *Screen),
		unregisterScreen: make(chan bool),
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
		case screen := <-g.registerScreen:
			if g.screen == nil {
				g.screen = screen
			}
		case <-g.unregisterScreen:
			g.screen = nil
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
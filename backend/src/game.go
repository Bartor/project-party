package main

import (
	"fmt"
	"strconv"
	"strings"
)

type Game struct {
	controllers map[*Controller]bool
	screen      *Screen

	controllerMessages chan []byte

	register   chan *Controller
	unregister chan *Controller

	registerScreen   chan *Screen
	unregisterScreen chan bool

	players map[*Controller]*Player
	shots   []*Shot
}

type Player struct {
	id    int
	xPos  int
	yPos  int
	angle int
}

type Shot struct {
	owner *Player
	xPos  int
	yPos  int
	angle int
}

func newGame() *Game {
	return &Game{
		controllers:        make(map[*Controller]bool),
		controllerMessages: make(chan []byte),
		register:           make(chan *Controller),
		unregister:         make(chan *Controller),
		registerScreen:     make(chan *Screen),
		unregisterScreen:   make(chan bool),
		players:            make(map[*Controller]*Player),
		shots:              make([]*Shot, 0),
	}
}

func (g *Game) run() {
	for {
		select {
		case controller := <-g.register:
			g.controllers[controller] = true
			newPlayer := &Player{len(g.players), 0, 0, 0}
			g.players[controller] = newPlayer
			select {
			case g.screen.input <- []byte(fmt.Sprintf("NewPlayer/%d/%d/%d/%d", newPlayer.id, newPlayer.xPos, newPlayer.yPos, newPlayer.angle)):
				fmt.Println("Sent information regarding new player of id %d", newPlayer.id)
			default:
				fmt.Println("huh")
			}
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
			shotAngle, moveSpeed, moveAngle := processPlayerMessage(string(message))

			if shotAngle != -1 {
				fmt.Printf("Player shooting at angle %d\n", shotAngle)
			}

			if moveSpeed >= 0 {
				fmt.Printf("Player moving at speed %f at angle %d\n", moveSpeed, moveAngle)
			}

			// DEFER RESULTS TO QUEUE THAT PROCESSES GAME UPDATES
			// select {
			// case g.screen.input <- message:
			// default:
			// 	close(g.screen.input)
			// }
		}
	}
}

/* Controllers sends in the following format: "${timestamp}/${moveString}/${shootString}"
timeStamp - nanoseconds since Unix EPOCH
moveString - [0, 1]:[0-360], defines whether a player wants to move, at what speed and in which direction
shootString - [0-360] | null, defines whether the player desires to shoot

Returns shotAngle, moveSpeed, moveAngle
*/
func processPlayerMessage(message string) (int, float64, int) {
	result := strings.Split(string(message), "/")
	if len(result) == 3 {
		_, moveString, shotString := result[0], result[1], result[2]
		var moveAngle int
		var shotAngle int
		var moveSpeed float64
		if shotString != "" {
			shotAngleTemp, shotAngleError := strconv.Atoi(shotString)
			if shotAngleError == nil {
				shotAngle = shotAngleTemp
			} else {
				shotAngle = -1
			}
		}

		if moveString != "" {
			moveStringResult := strings.Split(moveString, ":")
			moveSpeedTemp, moveSpeedErr := strconv.ParseFloat(moveStringResult[0], 64)
			moveAngleTemp, moveAngleErr := strconv.Atoi(moveStringResult[1])
			if moveSpeedErr == nil && moveAngleErr == nil {
				moveSpeed = moveSpeedTemp
				moveAngle = moveAngleTemp
			} else {
				moveSpeed = -1
				moveAngle = -1
			}
		}

		return shotAngle, moveSpeed, moveAngle
	}

	fmt.Println("Wrong message format")
	return -1, -1, -1
}

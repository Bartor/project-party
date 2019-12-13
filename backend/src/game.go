package main

import (
	"fmt"
	"math"
	"strconv"
	"strings"
	"time"
)
var currentId uint64 = 0

type Game struct {
	id	uint64
	controllers map[*Controller]bool
	screen      *Screen
	info				*GameInfo

	controllerMessages 		chan *ControllerMessage

	registerController   	chan *Controller
	unregisterController 	chan *Controller

	registerScreen   chan *Screen
	unregisterScreen chan bool

	registerGameInfo   chan *GameInfo
	unregisterGameInfo chan bool

	players    map[*Controller]*Player
	shots      []*Shot
	shotsFired uint64
}

type Player struct {
	id    int
	xPos  int
	yPos  int
	angle int
}

type Shot struct {
	id    uint64
	owner *Player
	xPos  int
	yPos  int
	angle int
}

type ControllerMessage struct {
	c       *Controller
	message []byte
}

func newGame() *Game {
	newId := currentId
	currentId++

	return &Game{
		id:										newId,
		controllers:        	make(map[*Controller]bool),
		controllerMessages: 	make(chan *ControllerMessage),
		registerController: 	make(chan *Controller),
		unregisterController: make(chan *Controller),
		registerScreen:     	make(chan *Screen),
		unregisterScreen:   	make(chan bool),
		registerGameInfo:     make(chan *GameInfo),
		unregisterGameInfo:   make(chan bool),
		players:            	make(map[*Controller]*Player),
		shots:              	make([]*Shot, 0),
		shotsFired:         	0,
	}
}

func findGameById(id uint64, games []*Game) *Game {
	for _, game := range games {
		if game.id == id {
			return game
		}
	}

	return nil
}

func (g *Game) run() {
	go processEvents(g)
	for {
		select {
		case controller := <-g.registerController:
			g.controllers[controller] = true
			newPlayer := &Player{len(g.players), 0, 0, 0}
			g.players[controller] = newPlayer
			select {
			case g.screen.input <- []byte(fmt.Sprintf("NewPlayer/%d/%d/%d/%d", newPlayer.id, newPlayer.xPos, newPlayer.yPos, newPlayer.angle)):
				fmt.Println("Sent information regarding new player of id ", newPlayer.id)
			default:
				fmt.Println("huh")
			}
		case controller := <-g.unregisterController:
			if _, ok := g.controllers[controller]; ok {
				delete(g.controllers, controller)
			}
		case screen := <-g.registerScreen:
			if g.screen == nil {
				g.screen = screen
			}
		case <-g.unregisterScreen:
			g.screen = nil
		case info := <-g.registerGameInfo:
			if g.info == nil {
				g.info = info

				g.info.input <- []byte(fmt.Sprintf("NewGame/%d", g.id))
			}
		case <-g.unregisterGameInfo:
			g.info = nil
		case cMessage := <-g.controllerMessages:
			shotAngle, moveSpeed, moveAngle := processPlayerMessage(string(cMessage.message))
			currPlayer := g.players[cMessage.c]
			if shotAngle != -1 {
				fmt.Printf("Player shooting at angle %d\n", shotAngle)
				currShot := &Shot{g.shotsFired + 1, currPlayer, int(float64(currPlayer.xPos) + math.Cos(float64(shotAngle)*math.Pi/180.0)*globalShotSpeed), int(float64(currPlayer.yPos) + math.Sin(float64(shotAngle)*math.Pi/180.0)*globalShotSpeed), shotAngle}
				g.shots = append(g.shots, currShot)
				g.shotsFired++
			}

			if moveSpeed >= 0 {
				fmt.Printf("Player moving at speed %f at angle %d\n", moveSpeed, moveAngle)
				currPlayer.xPos = int(moveSpeed*globalMoveSpeed*math.Cos(float64(moveAngle)*math.Pi/180.0)) + currPlayer.xPos
				currPlayer.yPos = int(moveSpeed*globalMoveSpeed*math.Sin(float64(moveAngle)*math.Pi/180.0)) + currPlayer.yPos
				currPlayer.angle = moveAngle
			}
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
		moveAngle = -1
		shotAngle = -1
		moveSpeed = -1

		if shotString != "" {
			shotAngleTemp, shotAngleError := strconv.Atoi(shotString)
			if shotAngleError == nil {
				shotAngle = shotAngleTemp
			}
		}

		if moveString != "" {
			moveStringResult := strings.Split(moveString, ":")
			moveSpeedTemp, moveSpeedErr := strconv.ParseFloat(moveStringResult[0], 64)
			moveAngleTemp, moveAngleErr := strconv.Atoi(moveStringResult[1])
			if moveSpeedErr == nil && moveAngleErr == nil {
				moveSpeed = moveSpeedTemp
				moveAngle = moveAngleTemp
			}
		}

		// fmt.Printf("DEBUG: %d/%d/%d\n", shotAngle, moveSpeed, moveAngle)
		return shotAngle, moveSpeed, moveAngle
	}

	fmt.Println("Wrong message format")
	return -1, -1, -1
}

func processEvents(g *Game) {
	for range time.Tick(time.Nanosecond * 100000000) {
		if g.screen != nil {
			updateString := ""
			if len(g.players) > 0 {
				for i := range g.players {
					currPlayer := g.players[i]
					updateString += fmt.Sprintf("%d/%d/%d/%d,", currPlayer.id, currPlayer.xPos, currPlayer.yPos, currPlayer.angle)
				}
				updateString = updateString[:len(updateString)-1]
			}
			updateString += ":"
			if len(g.shots) > 0 {
				for i := range g.shots {
					currShot := g.shots[i]
					updateString += fmt.Sprintf("%d/%d/%d/%d,", currShot.id, currShot.xPos, currShot.yPos, currShot.angle)
				}
				updateString = updateString[:len(updateString)-1]
			}
			fmt.Println(updateString)
			g.screen.input <- []byte(updateString)
		}
	}
}

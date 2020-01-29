package main

import (
	"fmt"
	"io/ioutil"
	"math"
	"net/http"
	"strconv"
	"strings"
	"time"
)

var currentId uint64 = 0

type Game struct {
	id          uint64
	controllers map[*Controller]bool
	screen      *Screen
	info        *GameInfo

	controllerMessages chan *ControllerMessage

	registerController   chan *Controller
	unregisterController chan *Controller

	registerScreen   chan *Screen
	unregisterScreen chan bool

	registerGameInfo   chan *GameInfo
	unregisterGameInfo chan bool

	players    map[*Controller]*Player
	// shots      []*Shot
	shotBank		ShotBank
	shotsFired uint64
	mapData    Map
}

type ControllerMessage struct {
	c       *Controller
	message []byte
}

func loadMap() (Map, error) {
	response, err := http.Get("http://map:3000/generate?width=60&height=60&fillPercentage=42")
	if err != nil {
		return Map{}, err
	}

	data, _ := ioutil.ReadAll(response.Body)

	return createMapFromJson(data), nil
}

func newGame() (*Game, error) {
	newId := currentId
	currentId++

	return &Game{
		id:                   newId,
		controllers:          make(map[*Controller]bool),
		controllerMessages:   make(chan *ControllerMessage),
		registerController:   make(chan *Controller),
		unregisterController: make(chan *Controller),
		registerScreen:       make(chan *Screen),
		unregisterScreen:     make(chan bool),
		registerGameInfo:     make(chan *GameInfo),
		unregisterGameInfo:   make(chan bool),
		players:              make(map[*Controller]*Player),
		// shots:                make([]*Shot, 0),
		shotBank:							NewShotBank(),
		shotsFired:           0,
	}, nil
}

func findGameById(id uint64, games []*Game) *Game {
	for _, game := range games {
		if game.id == id {
			return game
		}
	}

	return nil
}

func (g *Game) getPlayerPositions() string {
	result := ""
	if len(g.players) > 0 {
		for i := range g.players {
			currPlayer := g.players[i]
			if currPlayer.alive {
				result += fmt.Sprintf("%d/%f/%f/%d,", currPlayer.id, currPlayer.xPos, currPlayer.yPos, currPlayer.angle)
			}
		}
		if len(result) > 0 {
			result = result[:len(result)-1]
		}
	}

	return result
}

func (g *Game) getShotPositions() string {
	shotsChan := make(chan []Shot)
	g.shotBank.getShots<- GetShotsRequest{shotsChan}
	shots := <-shotsChan
	result := ""
	if len(shots) > 0 {
		for i := range shots {
			currShot := shots[i]
			if currShot.xPos <= 1.5 && currShot.xPos >= -0.5 && currShot.yPos >= -0.5 && currShot.yPos <= 1.5 {
				result += fmt.Sprintf("%d/%f/%f/%d,", currShot.id, currShot.xPos, currShot.yPos, currShot.angle)
			}
		}
		if len(result) > 0 {
			result = result[:len(result)-1]
		}
	}

	return result
}
func (g *Game) run() {
	loadedMap, err := loadMap()

	if err != nil {
		fmt.Printf("The HTTP request to grab map data failed with error %s\n", err)
		return
	}

	g.mapData = loadedMap

	go g.shotBank.Run()
	go processEvents(g)
	go processGameEvents(g)
	for {
		select {
		case controller := <-g.registerController:
			g.controllers[controller] = true
			startingXPos := g.mapData.SpawnPoints[len(g.players)%len(g.mapData.SpawnPoints)].X
			startingYPos := g.mapData.SpawnPoints[len(g.players)%len(g.mapData.SpawnPoints)].Y
			newPlayer := NewPlayer(g, startingXPos, startingYPos)
			g.players[controller] = newPlayer
			select {
			case g.info.input <- []byte(fmt.Sprintf("NewPlayer::%d", newPlayer.id)):
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
			messageToSend := []byte(fmt.Sprintf("NewRound::%s::", g.getPlayerPositions()))
			messageToSend = append(messageToSend, createJsonFromMap(g.mapData)...)
			g.info.input <- messageToSend
		case <-g.unregisterScreen:
			g.screen = nil
		case info := <-g.registerGameInfo:
			if g.info == nil {
				g.info = info
				messageToSend := []byte(fmt.Sprintf("NewGame::%d", g.id))
				g.info.input <- messageToSend
			}
		case <-g.unregisterGameInfo:
			g.info = nil
		case cMessage := <-g.controllerMessages:
			shotAngle, moveSpeed, moveAngle := processPlayerMessage(string(cMessage.message))
			currPlayer := g.players[cMessage.c]
			currPlayer.queueEvent(moveSpeed, moveAngle, shotAngle)
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

func processGameEvents(g *Game) {
	for range time.Tick(time.Nanosecond * refresh) {
		for i := range g.players {
			currPlayer := g.players[i]
			currPlayer.processLastEvent()
		}

		g.shotBank.moveShots <- true

		shotsChan := make(chan []Shot)
		g.shotBank.getShots<- GetShotsRequest{shotsChan}
		shots := <-shotsChan

		for _, currShot := range shots {
			if currShot.xPos >= 1 || currShot.xPos <= 0 || currShot.yPos >= 1 || currShot.yPos <= 0 {
				g.shotBank.deleteShot <- currShot.id
			}

			for _, wall := range g.mapData.Walls {
				for i := 0; i < len(wall)-1; i += 2 {
					xPosA := wall[i]
					yPosA := wall[i+1]
					xPosB := wall[(i+2)%len(wall)]
					yPosB := wall[(i+3)%len(wall)]
					if g.mapData.lineCircleCollision(xPosA, yPosA, xPosB, yPosB, currShot.xPos, currShot.yPos, unitSize) {
						g.shotBank.deleteShot <- currShot.id
					}
				}
			}
		}

		for _, currShot := range shots {
			for i := range g.players {
				currPlayer := g.players[i]
				if math.Abs(currShot.xPos-currPlayer.xPos) < 0.025 && math.Abs(currShot.yPos-currPlayer.yPos) < 0.025 && currShot.owner.id != currPlayer.id && currPlayer.alive {
					currPlayer.kill()
					g.shotBank.deleteShot <- currShot.id
					fmt.Println("Played with id ", currPlayer.id, " killed")
				}
			}
		}
	}
}

func processEvents(g *Game) {
	for range time.Tick(time.Nanosecond * fastRefresh) {
		if g.screen != nil {
			updateString := g.getPlayerPositions()
			updateString += ":"
			updateString += g.getShotPositions()
			// fmt.Println(updateString)
			g.screen.input <- []byte(updateString)
		}
	}
}

func Abs(x int64) int64 {
	if x < 0 {
		return -x
	}
	return x
}

package main

import (
	// "fmt"
	"math"
	"time"
)

type Player struct {
	game       *Game
	id         int
	xPos       float64
	yPos       float64
	angle      int
	eventQueue []*PlayerEvent
	alive      bool
	currSpeed  float64
	is_reloading bool
}

type PlayerEvent struct {
	moveSpeed float64
	moveAngle int
	shotAngle int
}

func NewPlayer(game *Game, xPos float64, yPos float64) *Player {
	return &Player{game, len(game.players), xPos, yPos, 0, make([]*PlayerEvent, 0), true, 0, false}
}

func (p *Player) queueEvent(moveSpeed float64, moveAngle int, shotAngle int) {
	p.eventQueue = append(p.eventQueue, &PlayerEvent{moveSpeed, moveAngle, shotAngle})
}

func (p *Player) processLastEvent() {
	var moveSpeed float64
	var moveAngle int

	if len(p.eventQueue) == 0 {
		p.currSpeed = math.Max(p.currSpeed - slowDown, 0)
		moveSpeed = p.currSpeed
		moveAngle = p.angle
	} else {
		currEvent := p.eventQueue[len(p.eventQueue)-1]
		moveSpeed = currEvent.moveSpeed
		moveAngle = currEvent.moveAngle

		if (p.alive) {
			p.shoot(currEvent.shotAngle)
		}
	}

	if p.alive {
		p.move(moveSpeed, moveAngle)
	}
	p.eventQueue = nil
}

func (p *Player) move(moveSpeed float64, moveAngle int) {
	if moveSpeed <= 0 {
		return
	}

	p.angle = moveAngle
	p.currSpeed = moveSpeed

	// fmt.Printf("Player moving at speed %f at angle %d\n", moveSpeed, moveAngle)
	newXPos := moveSpeed*globalMoveSpeed*math.Cos(float64(p.angle)*math.Pi/180.0) + p.xPos
	newYPos := moveSpeed*globalMoveSpeed*math.Sin(float64(p.angle)*math.Pi/180.0) + p.yPos

	for _, wall := range p.game.mapData.Walls {
		for i := 0; i < len(wall)-1; i += 2 {
			xPosA := wall[i]
			yPosA := wall[i+1]
			xPosB := wall[(i+2)%len(wall)]
			yPosB := wall[(i+3)%len(wall)]
			if p.game.mapData.lineCircleCollision(xPosA, yPosA, xPosB, yPosB, newXPos, newYPos, playerRadius) {
				// fmt.Println("Found collision with wall of index ", i)
				// fmt.Println("Wall coordinates", wall)
				// fmt.Println("Point X coordinates", wall[i], wall[i+1])
				// fmt.Println("Point Y coordinates", wall[i+2], wall[i+3])
				// fmt.Println("Player coordinates after moving and radius", newXPos, newYPos, playerRadius)
				return
			}
		}
	}

	p.xPos = newXPos
	p.yPos = newYPos
}

func (p *Player) shoot(shotAngle int) {
	if p.is_reloading {
		return;
	}
	if shotAngle < 0 {
		return
	}

	// fmt.Printf("Player shooting at angle %d\n", shotAngle)
	currShot := &Shot{p.game.shotsFired + 1, p, p.xPos + math.Cos(float64(shotAngle)*math.Pi/180.0)*globalShotSpeed, p.yPos + math.Sin(float64(shotAngle)*math.Pi/180.0)*globalShotSpeed, shotAngle}
	p.game.shots = append(p.game.shots, currShot)
	p.game.shotsFired++

	p.is_reloading = true;
	go func(){
		time.Sleep(reloadTime);
		p.is_reloading = false;
	}()

}

func (p *Player) kill() {
	p.alive = false
	go func() {
		time.Sleep(3 * time.Second)
		p.alive = true
	}()
}

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
}

type PlayerEvent struct {
	moveSpeed float64
	moveAngle int
	shotAngle int
}

func (p *Player) queueEvent(moveSpeed float64, moveAngle int, shotAngle int) {
	p.eventQueue = append(p.eventQueue, &PlayerEvent{moveSpeed, moveAngle, shotAngle})
}

func (p *Player) processLastEvent() {
	if len(p.eventQueue) == 0 {
		return
	}

	currEvent := p.eventQueue[len(p.eventQueue)-1]
	if p.alive {
		p.move(currEvent.moveSpeed, currEvent.moveAngle)
		p.shoot(currEvent.shotAngle)
	}
	p.eventQueue = nil
}

func (p *Player) move(moveSpeed float64, moveAngle int) {
	if moveSpeed < 0 {
		return
	}

	// fmt.Printf("Player moving at speed %f at angle %d\n", moveSpeed, moveAngle)
	newXPos := moveSpeed*globalMoveSpeed*math.Cos(float64(moveAngle)*math.Pi/180.0) + p.xPos
	newYPos := moveSpeed*globalMoveSpeed*math.Sin(float64(moveAngle)*math.Pi/180.0) + p.yPos

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
	p.angle = moveAngle
}

func (p *Player) shoot(shotAngle int) {
	if shotAngle < 0 {
		return
	}

	// fmt.Printf("Player shooting at angle %d\n", shotAngle)
	currShot := &Shot{p.game.shotsFired + 1, p, p.xPos + math.Cos(float64(shotAngle)*math.Pi/180.0)*globalShotSpeed, p.yPos + math.Sin(float64(shotAngle)*math.Pi/180.0)*globalShotSpeed, shotAngle}
	p.game.shots = append(p.game.shots, currShot)
	p.game.shotsFired++

}

func (p *Player) kill() {
	p.alive = false
	go func() {
		time.Sleep(3 * time.Second)
		p.alive = true
	}()
}

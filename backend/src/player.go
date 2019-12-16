package main

import (
	"fmt"
	"math"
	"time"
)

type Player struct {
	game       *Game
	id         int
	xPos       int
	yPos       int
	angle      int
	eventQueue []*PlayerEvent
	alive      bool
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
	p.move(currEvent.moveSpeed, currEvent.moveAngle)
	p.shoot(currEvent.shotAngle)
	p.eventQueue = nil
}

func (p *Player) move(moveSpeed float64, moveAngle int) {
	if moveSpeed < 0 {
		return
	}

	fmt.Printf("Player moving at speed %f at angle %d\n", moveSpeed, moveAngle)
	p.xPos = int(moveSpeed*globalMoveSpeed*math.Cos(float64(moveAngle)*math.Pi/180.0)) + p.xPos
	p.yPos = int(moveSpeed*globalMoveSpeed*math.Sin(float64(moveAngle)*math.Pi/180.0)) + p.yPos
	p.angle = moveAngle

}

func (p *Player) shoot(shotAngle int) {
	if shotAngle < 0 {
		return
	}

	fmt.Printf("Player shooting at angle %d\n", shotAngle)
	currShot := &Shot{p.game.shotsFired + 1, p, int(float64(p.xPos) + math.Cos(float64(shotAngle)*math.Pi/180.0)*globalShotSpeed), int(float64(p.yPos) + math.Sin(float64(shotAngle)*math.Pi/180.0)*globalShotSpeed), shotAngle}
	p.game.shots = append(p.game.shots, currShot)
	p.game.shotsFired++

}

func (p *Player) kill() {
	p.alive = false
	time.Sleep(3 * time.Second)
	p.alive = true
}

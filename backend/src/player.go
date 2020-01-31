package main

import (
	"math"
	"time"
)

type Player struct {
	game         *Game
	nick         string
	id           int
	xPos         float64
	yPos         float64
	angle        int
	eventQueue   []*PlayerEvent
	alive        bool
	currSpeed    float64
	is_reloading bool
	score        int
}

type PlayerEvent struct {
	moveSpeed float64
	moveAngle int
	shotAngle int
}

func NewPlayer(game *Game, nick string, xPos float64, yPos float64) *Player {
	return &Player{game, nick, len(game.players), xPos, yPos, 0, make([]*PlayerEvent, 0), true, 0, false, 0}
}

func (p *Player) queueEvent(moveSpeed float64, moveAngle int, shotAngle int) {
	p.eventQueue = append(p.eventQueue, &PlayerEvent{moveSpeed, moveAngle, shotAngle})
}

func (p *Player) processLastEvent() {
	var moveSpeed float64
	var moveAngle int

	if len(p.eventQueue) == 0 {
		p.currSpeed = math.Max(p.currSpeed-slowDown, 0)
		moveSpeed = p.currSpeed
		moveAngle = p.angle
	} else {
		currEvent := p.eventQueue[len(p.eventQueue)-1]
		moveSpeed = currEvent.moveSpeed
		moveAngle = currEvent.moveAngle
		if p.alive {
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
				wallAngle := 0.0
				if xPosA == xPosB {
					wallAngle = 4.0
				} else {
					wallAngle = math.Atan((yPosA - yPosB) / (xPosA - xPosB))
				}
				slope := 1
				if wallAngle < 0 {
					slope = -1
				}

				wallAngle = math.Abs(wallAngle)
				transformedX, transformedY := p.game.mapData.smoothCollison(wallAngle, newXPos, newYPos, p.xPos, p.yPos, slope)

				nextWallX := wall[(i+4)%len(wall)]
				nextWallY := wall[(i+5)%len(wall)]
				prevWallX := wall[betterModulo(i-2, len(wall))]
				prevWallY := wall[betterModulo(i-1, len(wall))]

				if p.game.mapData.lineCircleCollision(xPosA, yPosA, xPosB, yPosB, transformedX, transformedY, playerRadius) &&
					!p.game.mapData.lineCircleCollision(prevWallX, prevWallY, xPosA, yPosA, transformedX, transformedY, playerRadius) {
					continue
				}
				if p.game.mapData.lineCircleCollision(prevWallX, prevWallY, xPosA, yPosA, transformedX, transformedY, playerRadius) {
					return
				}
				if p.game.mapData.lineCircleCollision(xPosB, yPosB, nextWallX, nextWallY, transformedX, transformedY, playerRadius) {
					return
				}

				p.xPos, p.yPos = transformedX, transformedY
				return
			}
		}
	}

	p.xPos = newXPos
	p.yPos = newYPos
}

func betterModulo(a, b int) int {
	if a < 0 {
		return b + a%b
	} else {
		return a % b
	}
}

func (p *Player) shoot(shotAngle int) {
	if p.is_reloading {
		return
	}
	if shotAngle < 0 {
		return
	}

	// fmt.Printf("Player shooting at angle %d\n", shotAngle)
	currShot := Shot{p.game.shotsFired + 1, p, p.xPos + math.Cos(float64(shotAngle)*math.Pi/180.0)*globalShotSpeed, p.yPos + math.Sin(float64(shotAngle)*math.Pi/180.0)*globalShotSpeed, shotAngle}
	p.game.shotBank.addShot <- currShot
	p.game.shotsFired++

	p.is_reloading = true
	go func() {
		time.Sleep(reloadTime)
		p.is_reloading = false
	}()

}

func (p *Player) kill() {
	p.alive = false
}

func (p *Player) respawn() {
	lowerRollBound := (len(p.game.mapData.SpawnPoints) / len(p.game.players)) * p.id
	upperRollBound := (len(p.game.mapData.SpawnPoints) / len(p.game.players)) * (p.id + 1)
	rollIndex := (rng.Intn(upperRollBound-lowerRollBound) + lowerRollBound) % len(p.game.mapData.SpawnPoints)
	p.xPos = p.game.mapData.SpawnPoints[rollIndex].X
	p.yPos = p.game.mapData.SpawnPoints[rollIndex].Y
	p.alive = true
}

// Copyright 2020 Project: Party. All rights Reserved

// The main package of the game
package main

import (
	"math"
)

// Shot holds information about the current shot, including its position, owner and the angle it's moving at
type Shot struct {
	id    uint64
	owner *Player
	xPos  float64
	yPos  float64
	angle int
}

// move() updates the Shot's position based on its angle and current position
func (s *Shot) move() {
	s.xPos = globalShotSpeed*math.Cos(float64(s.angle)*math.Pi/180.0) + s.xPos
	s.yPos = globalShotSpeed*math.Sin(float64(s.angle)*math.Pi/180.0) + s.yPos
}

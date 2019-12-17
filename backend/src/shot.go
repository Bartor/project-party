package main

import (
	"math"
)

type Shot struct {
	id    uint64
	owner *Player
	xPos  float64
	yPos  float64
	angle int
}

func (s *Shot) move() {
	s.xPos = globalShotSpeed*math.Cos(float64(s.angle)*math.Pi/180.0) + s.xPos
	s.yPos = globalShotSpeed*math.Sin(float64(s.angle)*math.Pi/180.0) + s.yPos
}

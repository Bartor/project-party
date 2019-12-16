package main

import (
	"math"
)

type Shot struct {
	id    uint64
	owner *Player
	xPos  int
	yPos  int
	angle int
}

func (s *Shot) move() {
	s.xPos = int(globalShotSpeed*math.Cos(float64(s.angle)*math.Pi/180.0)) + s.xPos
	s.yPos = int(globalShotSpeed*math.Sin(float64(s.angle)*math.Pi/180.0)) + s.yPos
}

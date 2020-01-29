// Copyright 2020 Project: Party. All rights Reserved

// The main package of the game
package main

import (
	"encoding/json"
	// "fmt"
	"math"
)

type Map struct {
	MapData     [][]int     `json:"map"`
	Walls       [][]float64 `json:"walls"`
	SpawnPoints []struct {
		X float64 `json:"x"`
		Y float64 `json:"y"`
	} `json:"spawnPoints"`
	ErrorInfo interface{} `json:"error"`
}

// createMapFromJson(jsonData []byte) creates a Map structure based on JSON data from the generator
func createMapFromJson(jsonData []byte) Map {
	var newMap Map
	json.Unmarshal(jsonData, &newMap)
	return newMap
}

// createJsonFromMap(mapData Map) creates a JSON object for the screen websocket based on Map structure
func createJsonFromMap(mapData Map) []byte {
	jsonData, _ := json.Marshal(&mapData)
	return jsonData
}

// circleCircleCollision(xPosA, yPosA, radiusA, xVelocityA, yVelocityA, xPosB, yPosB, radiusB, xVelocityB, yVelocityB float64)
// checks if two circles collide in any point of time given the position (xPosA, yPosA),
// the velocity (xVelocityA, yVelocityA) and the radius (radiusA) of the circle A and
// the position (xPosB, yPosB), the velocity (xVelocityB, yVelocityB) and the radius (radiusB)
// of the circle B.
func (m *Map) circleCircleCollision(xPosA, yPosA, radiusA, xVelocityA, yVelocityA, xPosB, yPosB, radiusB, xVelocityB, yVelocityB float64) bool {
	var xVelocityAB = xVelocityA - xVelocityB
	var yVelocityAB = yVelocityA - yVelocityB
	var xPosAB = xPosA - xPosB
	var yPosAB = yPosA - yPosB

	// Calculate delta of the quadradiusAtic equation (b^2 - 4ac)
	var a = xVelocityAB*xVelocityAB + yVelocityAB*yVelocityAB
	var b = 2 * (xPosAB*xVelocityAB + yPosAB*yVelocityAB)
	var c = xPosAB*xPosAB + yPosAB*yPosAB - (radiusA+radiusB)*(radiusA+radiusB)

	var delta = b*b - 4*a*c

	// If any solution exists, return true
	if delta >= 0 {
		return true
	}
	return false
}

// lineLineCollision(x1, y1, x2, y2, x3, y3, x4, y4 float64) checks whether [(x1, y1), (x2, y2)] intersects [(x3, y3), (x4, y4)]
func (m *Map) lineLineCollision(x1, y1, x2, y2, x3, y3, x4, y4 float64) bool {

	c := (x1-x2)*(y3-y4) - (y1-y2)*(x3-x4)

	if c == 0 {
		return false
	}

	u := -((x1-x2)*(y1-y3) - (y1-y2)*(x1-x3)) / c
	t := ((x1-x3)*(y3-y4) - (y1-y3)*(x3-x4)) / c

	if u >= 0 && u <= 1 || t >= 0 && t <= 1 {
		return true
	}

	return false

}

// lineCircleCollision(x1, y1, x2, y2, cx, cy, r float64) checks whether [(x1, y1), (x2, y2)] intersects circle with centre in (cx, cy) and radius r
func (m *Map) lineCircleCollision(x1, y1, x2, y2, cx, cy, r float64) bool {

	a := (x2-x1)*(x2-x1) + (y2-y1)*(y2-y1)
	b := (-2) * ((cx-x1)*(x2-x1) + (cy-y1)*(y2-y1))
	c := (cx-x1)*(cx-x1) + (cy-y1)*(cy-y1) - r*r

	delta := b*b - 4*a*c

	if delta >= 0 {
		t1 := (-b - math.Sqrt(delta)) / (2 * a)
		t2 := (-b + math.Sqrt(delta)) / (2 * a)

		if (t1 >= 0.0 && t1 <= 1.0) || (t2 >= 0.0 && t2 <= 1.0) {
			// fmt.Println("a b c delta t1 t2", a, b, c, delta, t1, t2)
			return true
		}
	}

	return false
}

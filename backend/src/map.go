package main

import (
	"encoding/json"
)

type Map struct {
	MapData   [][]int     `json:"map"`
	Walls     [][]float64 `json:"walls"`
	ErrorInfo interface{} `json:"error"`
}

func createMapFromJson(jsonData []byte) Map {
	var newMap Map
	json.Unmarshal(jsonData, &newMap)
	return newMap
}

func createJsonFromMap(mapData Map) []byte {
	jsonData, _ := json.Marshal(&mapData)
	return jsonData
}

/*
	Checks if two circles collide in any point of time given the position (xPosA, yPosA),
	the velocity (xVelocityA, yVelocityA) and the radius (radiusA) of the circle A and 
	the position (xPosB, yPosB), the velocity (xVelocityB, yVelocityB) and the radius (radiusB)
	of the circle B.
*/
func (m *Map) circleCircleCollision(xPosA, yPosA, radiusA, xVelocityA, yVelocityA, xPosB, yPosB, radiusB, xVelocityB, yVelocityB float64) bool {
	var xVelocityAB = xVelocityA - xVelocityB
	var yVelocityAB = yVelocityA - yVelocityB
	var xPosAB = xPosA - xPosB
	var yPosAB = yPosA - yPosB

	// Calculate delta of the quadradiusAtic equation (b^2 - 4ac)
	var a = xVelocityAB * xVelocityAB + yVelocityAB * yVelocityAB
	var b = 2 * (xPosAB * xVelocityAB + yPosAB * yVelocityAB)
	var c = xPosAB * xPosAB + yPosAB * yPosAB - (radiusA + radiusB) * (radiusA + radiusB)

	var delta = b * b - 4 * a * c

	// If any solution exists, return true
	if (delta >= 0) {
		return true
	}
	return false
}
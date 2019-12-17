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

// does [(x1, y1), (x2, y2)] intersect [(x3, y3), (x4, y4)]?
func (m *Map) lineLineCollision(x1, y1, x2, y2, x3, y3, x4, y4 float64) bool {

	c := (x1-x2) * (y3-y4) - (y1-y2) * (x3-x4)
	
	if c == 0 {
		return false
	}

	u := -((x1-x2) * (y1-y3) - (y1-y2) * (x1-x3)) / c
	t := ((x1-x3) * (y3-y4) - (y1-y3) * (x3-x4)) / c

	if u >= 0 && u <= 1 || t >= 0 && t <= 1 {
		return true
	} 
	
	return false

}
// does [(x1, y1), (x2, y2)] intersect circle with centre in (cx, cy) and radius r 
func (m *Map) lineCircleCollision(x1, y1, x2, y2, cx, cy, r float64) bool {
	
	a := (x2-x1) * (x2-x1) + (y2-y1) * (y2-y1)
	b := (-2) * ((cx-x1) * (x2-x1) + (cy-y1) * (y2-y1))
	c := (cx-x1) * (cx-x1) + (cy-y1) * (cy-y1) - r*r

	delta := b*b-4*a*c

	if delta >= 0 {
		t1 := (-b - math.Sqrt(delta))/(2*a)
		t2 := (-b + math.Sqrt(delta))/(2*a)
		
		if t1 >= 0 && t2 >= 0 {
			return true
		}
	}

	return false
}
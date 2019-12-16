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

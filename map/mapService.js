const express = require('express')
const app = express()
const MapGenerator = require('./generator/mapGenerator.js')
const MeshGenerator = require('./generator/meshGenerator.js')
const port = 3000

function isNeighbourWall(x, y, map) {
    for(var neighbourX = x - 1; neighbourX <= x + 1; neighbourX++) {
        for (var neighbourY = y - 1; neighbourY <= y + 1; neighbourY++) {
            // If any neighbour is a wall, return true
            if (map[neighbourX][neighbourY] === 1) {
                return true
            }
        }
    }
    return false
}

app.get('/', (req, res) => res.send('You can generate a random map using this service'))
app.get('/generate', (req, res) => {
    var { width, height, fillPercentage } = req.query

    if (!width || !height || !fillPercentage || isNaN(width) || isNaN(height) || isNaN(fillPercentage)) {
        res.status(400).json({
            map: null,
            walls: null,
            error: 'Wrong parameters'
        })
    } else {
        var map = new MapGenerator(parseInt(width), parseInt(height))
        map.randomFillPercent = parseInt(fillPercentage)
        map.generateMap()
        var mesh = new MeshGenerator(map.map, 1.0 / map.width)
        var outlines = mesh.calculateOutlines()
        
        var ratio = map.width / map.height
        outlines.map(array => {
            array.map(vertex => {
                vertex.y *= ratio
            })
        })
        outlines = outlines.map(array => array.reduce((res, vertex) => {
            res.push(vertex.x, vertex.y)
            return res
        }, []))

        // Create a new array of the same size as the map
        var processedMap = [...Array(map.width)].map(x => Array(map.height).fill(1))
        var spawnPoints = []
        for (var y = 1; y < processedMap.length - 1; y++) {
            for (var x = 1; x < processedMap[0].length; x++) {
                // Iterate over neighbours
                if (map.map[y][x] === 0) {
                    if (isNeighbourWall(x, y, map.map)) {
                        processedMap[y][x] = 1
                    } else {
                        processedMap[y][x] = 0
                        spawnPoints.push({x: (x+0.5)/(map.width), y: (y+0.5)/(map.height)})
                    }
                }
            }
        }
        res.status(200).json({
            map: map.map,
            spawnPoints: spawnPoints,
            walls: outlines,
            error: null
        })
    }
})

app.listen(port, () => console.log(`Map service listening on port ${port}!`))
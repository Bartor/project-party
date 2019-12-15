const express = require('express')
const app = express()
const MapGenerator = require('./generator/mapGenerator.js')
const MeshGenerator = require('./generator/meshGenerator.js')
const port = 3000

app.get('/', (req, res) => res.send('You can generate a random map using this service'))
app.get('/generate', (req, res) => {
    var { width, height } = req.query

    if (!width || !height || isNaN(width) || isNaN(height)) {
        res.status(400).json({
            map: null,
            walls: null,
            error: 'Wrong parameters'
        })
    } else {
        var map = new MapGenerator(parseInt(width), parseInt(height))
        map.randomFillPercent = 42
        map.generateMap()
        var mesh = new MeshGenerator(map.map, 2.0 / map.width)
        var outlines = mesh.calculateOutlines()
        
        outlines = outlines.map(array => array.reduce((res, vertex) => {
            res.push(vertex.x, vertex.y)
            return res
        }, []))

        res.status(200).json({
            map: map.map,
            walls: outlines,
            error: null
        })
    }
})

app.listen(port, () => console.log(`Map service listening on port ${port}!`))
import { Queue } from './utils.js'

export class MapGenerator {
    constructor(width, height) {
        this.width = width
        this.height = height
        this.map = [...Array(width)].map(x => Array(width).fill(0))
        this.randomFillPercent = 50
    }

    generateMap() {
        this.randomFillMap()
        for (var i = 0; i < 10; i ++) {
			this.smoothMap();
        }

        this.processMap()

        // Add a border to the map in order to generate walls properly
        var borderSize = 1;
        var borderedMap = [...Array(this.width + borderSize * 2)].map(x => Array(this.height + borderSize * 2).fill(0))

        for (var x = 0; x < borderedMap.length; x++) {
            for (var y = 0; y < borderedMap[0].length; y++) {
                if (x >= borderSize && x < this.width + borderSize && y >= borderSize && y < this.height + borderSize) {
					borderedMap[x][y] = this.map[x-borderSize][y-borderSize];
				}
				else {
					borderedMap[x][y] = 1;
				}
            }
        }

        this.map = borderedMap
        this.width = this.map.length
        this.height = this.map[0].length
    }

    processMap() {
        var wallRegions = this.getRegions(1)
        var wallThresholdSize = 20

        wallRegions.forEach(wallRegion => {
            if (wallRegion.length < wallThresholdSize) {
                wallRegion.forEach(tile => {
                    this.map[tile.tileX][tile.tileY] = 0
                })
            }
        })
    }

    getRegions(tileType) {
        var regions = []
        var mapFlags = [...Array(this.width)].map(x => Array(this.height).fill(0)) 

        for (var x = 0; x < this.width;  x++) {
			for (var y = 0; y < this.height; y++) {
				if (mapFlags[x][y] === 0 && this.map[x][y] === tileType) {
					var newRegion = this.getRegionTiles(x,y);
					regions.push(newRegion);

                    newRegion.forEach(tile => {
                        mapFlags[tile.tileX][tile.tileY] = 1
                    })
				}
			}
		}

		return regions;
    }

    getRegionTiles(startX, startY) {
        var tiles = []
        var mapFlags = [...Array(this.width)].map(x => Array(this.height).fill(0))
        var tileType = this.map[startX][startY]

        var queue = new Queue()
        queue.enqueue(new Coord(startX, startY))
        mapFlags[startX][startY] = 1

        while(queue.size() > 0) {
            var tile = queue.dequeue()
            tiles.push(tile)

            for (var x = tile.tileX - 1; x <= tile.tileX + 1; x++) {
                for (var y = tile.tileY - 1; y <= tile.tileY + 1; y++) {
                    if (this.isInMapRange(x, y) && (y === tile.tileY || x === tile.tileX)) {
                        if (mapFlags[x][y] === 0 && this.map[x][y] === tileType) {
                            mapFlags[x][y] = 1
                            queue.enqueue(new Coord(x, y))
                        }
                    }
                }
            }
        }

        return tiles;
    }

    isInMapRange(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height
    }

    randomFillMap() {
        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
                if (x == 0 || x == this.width-1 || y == 0 || y == this.height -1) {
					this.map[x][y] = 1;
				}
				else {
					this.map[x][y] = (Math.random() * 100 < this.randomFillPercent)? 1: 0;
				}
            }
        }
    }

    getSurroundingWallCount(gridX, gridY, map) {
        var wallCount = 0
        for(var neighbourX = gridX - 1; neighbourX <= gridX + 1; neighbourX++) {
            for (var neighbourY = gridY - 1; neighbourY <= gridY + 1; neighbourY++) {
                // Check if neighbours are still in the map and count them as walls otherwise
                if (this.isInMapRange(neighbourX, neighbourY)) {
					if (neighbourX != gridX || neighbourY != gridY) {
						wallCount += map[neighbourX][neighbourY];
					}
				}
				else {
					wallCount++;
				}
            }
        }

        return wallCount
    }

    smoothMap() {
        // Copy the map before modifying its content
        var mapCopy = this.map.map(function(arr) {
            return arr.slice();
        });

		for (var x = 0; x < this.width; x++) {
			for (var y = 0; y < this.height; y++) {
				var neighbourWallTiles = this.getSurroundingWallCount(x, y, mapCopy);

				if (neighbourWallTiles > 4)
					this.map[x][y] = 1;
				else if (neighbourWallTiles < 4)
					this.map[x][y] = 0;

			}
		}
    }
    
    getTriangles(pixelWidth) {
        var triangles = []

        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
                if (this.map[x][y] === 1) {
                    triangles.push(1 - x * pixelWidth)
                    triangles.push(1 - y * pixelWidth)
    
                    triangles.push(1 - (x + 1) * pixelWidth)
                    triangles.push(1 - y * pixelWidth)
    
                    triangles.push(1 - x * pixelWidth)
                    triangles.push(1 - (y + 1) * pixelWidth)
                    
                    triangles.push(1 - (x + 1) * pixelWidth)
                    triangles.push(1 - y * pixelWidth)
    
                    triangles.push(1 - (x + 1) * pixelWidth)
                    triangles.push(1 - (y + 1) * pixelWidth)
    
                    triangles.push(1 - x * pixelWidth)
                    triangles.push(1 - (y + 1) * pixelWidth)
                }
            }
        }

        return triangles
    }
}

class Coord {
    constructor(x, y) {
        this.tileX = x
        this.tileY = y
    }
}
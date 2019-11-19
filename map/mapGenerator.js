import { createArray } from './utils.js'

export class MapGenerator {
    constructor(width, height) {
        this.width = width
        this.height = height
        this.map = createArray(width, height)
        this.randomFillPercent = 100
    }

    generateMap() {
        this.randomFillMap()
        for (var i = 0; i < 10; i ++) {
			this.smoothMap();
		}
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
                if (neighbourX >= 0 && neighbourX < this.width && neighbourY >= 0 && neighbourY < this.height) {
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
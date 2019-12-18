const { Queue } = require('./utils.js')

/**
 * @class Class generating map using cellular automaton. It also ensures that every region in the map is reachable from any other region.
 */
class MapGenerator {
    /**
     * Creates an instance of the generator.
     * 
     * @constructor
     * @param {number} width Width of the square grid.
     * @param {number} height Height of the square grid.
     */
    constructor(width, height) {
        this.width = width
        this.height = height
        this.map = [...Array(width)].map(x => Array(height).fill(0))
        this.randomFillPercent = 50
    }

    /**
     * Generates a random map with obstacles and ensures connectivity between generated regions.
     */
    generateMap() {
        this.randomFillMap()
        // Play Game of Life ten times
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


    /**
     * Analyzes the map in order to detect regions and walls and ensures that every room is reachable.
     */
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

        var roomRegions = this.getRegions(0)
        var roomThresholdSize = 20
        var survivingRooms = []

        roomRegions.forEach(roomRegion => {
            // Delete a room if it's too small
            if (roomRegion.length < roomThresholdSize) {
                roomRegion.forEach(tile => {
                    this.map[tile.tileX][tile.tileY] = 1
                })
            } else {
                survivingRooms.push(new Room(roomRegion, this.map))
            }
        })

        survivingRooms = survivingRooms.sort((a, b) => a - b)
        survivingRooms[0].isMainRoom = true
        survivingRooms[0].isAccessibleFromMainRoom = true

        // Connect every room
        this.connectClosestRooms(survivingRooms)
    }

    /**
     * Finds closest connections between rooms.
     * 
     * @param {Array} allRooms All found rooms.
     * @param {boolean} forceAccessibilityFromMainRoom 
     */
    connectClosestRooms(allRooms, forceAccessibilityFromMainRoom = false) {
        var roomListA = [] // List of rooms not accessible from the main room
        var roomListB = [] // List of room accesible from the main room

        // If we force accessibility from the main room, we want to find all connections from the already accessible rooms to all not accessible ones.
        // Otherwise we find connections between all rooms.
        if (forceAccessibilityFromMainRoom) {
            allRooms.forEach(room => {
                if (room.isAccessibleFromMainRoom) {
                    roomListB.push(room)
                } else {
                    roomListA.push(room)
                }
            })
        } else {
            roomListA = allRooms
            roomListB = allRooms
        }

        var bestDistance = 0
        var bestTileA = new Coord()
        var bestTileB = new Coord()
        var bestRoomA = new Room()
        var bestRoomB = new Room()
        var possibleConnectionFound = false

        for (let roomA of roomListA) {
            // If we force accessibility from the main room, we want to find the best connection across all not already connected rooms.
            // Otherwise we want to find the best connection for every room, so we have to reset possibleConnectionFound variable to false in every iteration.
            if (!forceAccessibilityFromMainRoom) {
                possibleConnectionFound = false
                if (roomA.connectedRooms.length > 0) continue
            }

            for (let roomB of roomListB) {
                if (roomA === roomB || roomA.isConnected(roomB)) continue

                // Iterate over edge tiles and find the closest ones (one in each region)
                for (var tileIndexA = 0; tileIndexA < roomA.edgeTiles.length; tileIndexA++) {
                    for (var tileIndexB = 0; tileIndexB < roomB.edgeTiles.length; tileIndexB++) {
                        var tileA = roomA.edgeTiles[tileIndexA]
                        var tileB = roomB.edgeTiles[tileIndexB]

                        // We don't need to calculate the square root, because we only want to compare "distances"
                        var distanceBetweenRooms = Math.pow(tileA.tileX - tileB.tileX, 2) + Math.pow(tileA.tileY - tileB.tileY, 2)

                        if (distanceBetweenRooms < bestDistance || !possibleConnectionFound) {
                            bestDistance = distanceBetweenRooms
                            possibleConnectionFound = true
                            bestTileA = tileA
                            bestTileB = tileB
                            bestRoomA = roomA
                            bestRoomB = roomB
                        }
                    }
                }
            }

            if (possibleConnectionFound && !forceAccessibilityFromMainRoom) {
                this.createPassage(bestRoomA, bestRoomB, bestTileA, bestTileB)
            }
        }

        if (possibleConnectionFound && forceAccessibilityFromMainRoom) {
            this.createPassage(bestRoomA, bestRoomB, bestTileA, bestTileB)
            this.connectClosestRooms(allRooms, true)
        }

        if (!forceAccessibilityFromMainRoom) {
            this.connectClosestRooms(allRooms, true)
        }
    }

    /**
     * Creates a passage of the radius of 5 squares between roomA and roomB from tileA to tileB.
     * 
     * @param {Room} roomA First room.
     * @param {Room} roomB Second room.
     * @param {Coord} tileA Closest tile from the first room.
     * @param {Coord} tileB Closest tile from the second room.
     */
    createPassage(roomA, roomB, tileA, tileB) {
        connectRooms(roomA, roomB)

        var line = this.getLine(tileA, tileB)
        line.forEach(c => {
            this.drawCircle(c, 5)
        })
    }

    /**
     * Puts zeroes within the radius of the given point.
     * 
     * @param {Coord} c Coord object representing the center of the circle. 
     * @param {number} r Radius of the circle.
     */
    drawCircle(c, r) {
        for (var x = -r; x <= r; x++) {
            for (var y = -r; y <= r; y++) {
                if (x*x + y*y <= r*r) {
                    var drawX = c.tileX + x
                    var drawY = c.tileY + y
                    if (this.isInMapRange(drawX, drawY)) {
                        this.map[drawX][drawY] = 0
                    }
                }
            }
        }
    }

    /**
     * Returns an array of squares (coordinates) lying on the line between given points.
     * 
     * @param {Coord} from Starting point.
     * @param {Coord} to Ending point.
     * 
     * @returns {Array} Line coordinates.
     */
    getLine(from, to) {
        var line = []

        var x = from.tileX
        var y = from.tileY

        var dx = to.tileX - from.tileX
        var dy = to.tileY - from.tileY

        var inverted = false
        // Determine in which direction should we increase values in each step
        var step = Math.sign(dx)
        var gradientStep = Math.sign(dy)

        var longest = Math.abs(dx)
        var shortest = Math.abs(dy)

        if (longest < shortest) {
            inverted = true
            longest = Math.abs(dy)
            shortest = Math.abs(dx)
            
            step = Math.sign(dy)
            gradientStep = Math.sign(dx)
        }

        var gradientAccumulation = longest / 2
        for (var i = 0; i < longest; i++) {
            line.push(new Coord(x, y))

            if (inverted) {
                y += step
            } else {
                x += step
            }

            gradientAccumulation += shortest
            if (gradientAccumulation >= longest) {
                if (inverted) {
                    x += gradientStep
                } else {
                    y += gradientStep
                }
                gradientAccumulation -= longest
            }
        }

        return line
    }

    /**
     * Returns all regions containing tiles of the given type using the Flood fill algorithm.
     * 
     * @param {number} tileType Type of tiles (0 or 1).
     * 
     * @returns {Array} List of regions.
     */
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

    /**
     * Returns a region containing the starting point.
     * 
     * @param {number} startX X coordinate of the starting point.
     * @param {number} startY Y coordinate of the starting point.
     * 
     * @returns {Array} List of tiles.
     */
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

    /**
     * Checks if the given point is in the map.
     * 
     * @param {number} x X coordinate.
     * @param {number} y Y coordinate.
     */
    isInMapRange(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height
    }

    /**
     * Fills the map with zeroes and ones (with the given probability).
     */
    randomFillMap() {
        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
                if (x === 0 || x === this.width-1 || y === 0 || y === this.height -1) {
					this.map[x][y] = 1;
				}
				else {
					this.map[x][y] = (Math.random() * 100 < this.randomFillPercent)? 1: 0;
				}
            }
        }
    }

    /**
     * Counts wall tiles surrounding the given point.
     * 
     * @param {number} gridX X coordinate of the point.
     * @param {number} gridY Y coordinate of the point.
     * @param {Array} map Two dimensional array representing the map.
     * 
     * @returns {number} Number of wall tiles.
     */
    getSurroundingWallCount(gridX, gridY, map) {
        var wallCount = 0
        for(var neighbourX = gridX - 1; neighbourX <= gridX + 1; neighbourX++) {
            for (var neighbourY = gridY - 1; neighbourY <= gridY + 1; neighbourY++) {
                // Check if neighbours are still in the map and count them as walls otherwise
                if (this.isInMapRange(neighbourX, neighbourY)) {
					if (neighbourX !== gridX || neighbourY !== gridY) {
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

    /**
     * Smooths the map by keeping tiles that have at least 5 ones as neighbours.
     */
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
    
    /**
     * Converts squares to appropriate tiangles.
     * 
     * @param {number} pixelWidth Size of a square (tile).
     * 
     * @returns {Array} List of triangles representing squares on the map.
     */
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

/**
 * @class Stores coordinates of the point.
 */
class Coord {
    /**
     * Creates a new point.
     * 
     * @constructor
     * @param {number} x X coordinate.
     * @param {number} y Y coordinate.
     */
    constructor(x, y) {
        this.tileX = x
        this.tileY = y
    }
}

/**
 * @class Class representing a reqion on the map. It stores all necessary information to ensure connectivity within the map.
 */
class Room {
    /**
     * Creates an instance of the Room class.
     * 
     * @constructor
     * @param {Array} roomTiles Tiles creating a room.
     * @param {Array} map Map representation.
     */
    constructor(roomTiles, map) {
        this.tiles = roomTiles ? roomTiles : []
        this.edgeTiles = []
        this.connectedRooms = [] // Stores all rooms directly accesible from this room (direct neighbour)
        this.roomSize = roomTiles ? roomTiles.length : 0
        this.isMainRoom = false
        this.isAccessibleFromMainRoom = false

        // Find all edge tiles in the given tiles array
        this.tiles.forEach(tile => {
            for (var x = tile.tileX - 1; x <= tile.tileX + 1; x++) {
                for (var y = tile.tileY - 1; y < tile.tileY + 1; y++) {
                    if (x === tile.tileX || y === tile.tileY) {
                        if (map[x][y] === 1) {
                            this.edgeTiles.push(tile)
                        }
                    }
                }
            }
        })
    }

    /**
     * Sets that the room is accessible from the main room as well as all rooms connected with this one.
     */
    setAccessibleFromMainRoom() {
        if (!this.isAccessibleFromMainRoom) {
            this.isAccessibleFromMainRoom = true
            this.connectedRooms.forEach(connectedRoom => {
                connectedRoom.setAccessibleFromMainRoom()
            })
        }
    }

    /**
     * Checks if given room is connected with this room.
     * 
     * @param {Room} otherRoom Room we want to check connection with.
     * @returns {boolean} True if connected, false - otherwise.
     */
    isConnected(otherRoom) {
        return this.connectedRooms.includes(otherRoom)
    }
}

/**
 * Connects given rooms by adding to each other's list of connected rooms. If one of them is connected to the main room, the other one will also get connected.
 * 
 * @param {Room} roomA First room.
 * @param {Room} roomB Second room.
 */
function connectRooms(roomA, roomB) {
    if (roomA.isAccessibleFromMainRoom) {
        roomB.setAccessibleFromMainRoom()
    } else if (roomB.isAccessibleFromMainRoom) {
        roomA.setAccessibleFromMainRoom()
    }

    roomA.connectedRooms.push(roomB)
    roomB.connectedRooms.push(roomA)
}

module.exports = MapGenerator

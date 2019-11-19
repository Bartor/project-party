import { createArray } from './utils.js'

export class MeshGenerator {
    constructor(map, squareSize) {
        this.squareGrid = new SquareGrid(map, squareSize)
        this.vertices = []

        for (var x = 0; x < this.squareGrid.squares.length; x++) {
			for (var y = 0; y < this.squareGrid.squares[0].length; y++) {
				this.triangulateSquare(this.squareGrid.squares[x][y]);
			}
		}

    }

    triangulateSquare(square) {
        switch (square.configuration) {
            case 0:
                break;

            // 1 points:
            case 1:
                this.meshFromPoints(square.centreBottom, square.bottomLeft, square.centreLeft);
                break;
            case 2:
                this.meshFromPoints(square.centreRight, square.bottomRight, square.centreBottom);
                break;
            case 4:
                this.meshFromPoints(square.centreTop, square.topRight, square.centreRight);
                break;
            case 8:
                this.meshFromPoints(square.topLeft, square.centreTop, square.centreLeft);
                break;

            // 2 points:
            case 3:
                this.meshFromPoints(square.centreRight, square.bottomRight, square.bottomLeft, square.centreLeft);
                break;
            case 6:
                this.meshFromPoints(square.centreTop, square.topRight, square.bottomRight, square.centreBottom);
                break;
            case 9:
                this.meshFromPoints(square.topLeft, square.centreTop, square.centreBottom, square.bottomLeft);
                break;
            case 12:
                this.meshFromPoints(square.topLeft, square.topRight, square.centreRight, square.centreLeft);
                break;
            case 5:
                this.meshFromPoints(square.centreTop, square.topRight, square.centreRight, square.centreBottom, square.bottomLeft, square.centreLeft);
                break;
            case 10:
                this.meshFromPoints(square.topLeft, square.centreTop, square.centreRight, square.bottomRight, square.centreBottom, square.centreLeft);
                break;

            // 3 point:
            case 7:
                this.meshFromPoints(square.centreTop, square.topRight, square.bottomRight, square.bottomLeft, square.centreLeft);
                break;
            case 11:
                this.meshFromPoints(square.topLeft, square.centreTop, square.centreRight, square.bottomRight, square.bottomLeft);
                break;
            case 13:
                this.meshFromPoints(square.topLeft, square.topRight, square.centreRight, square.centreBottom, square.bottomLeft);
                break;
            case 14:
                this.meshFromPoints(square.topLeft, square.topRight, square.bottomRight, square.centreBottom, square.centreLeft);
                break;

            // 4 point:
            case 15:
                this.meshFromPoints(square.topLeft, square.topRight, square.bottomRight, square.bottomLeft);
                break;
        }
    }

    meshFromPoints(...points) {
        // Add points representing triangles
        if (points.length >= 3)
            this.vertices.push(points[0].position, points[1].position, points[2].position);
        if (points.length >= 4)
            this.vertices.push(points[0].position, points[2].position, points[3].position);
        if (points.length >= 5)
            this.vertices.push(points[0].position, points[3].position, points[4].position);
        if (points.length >= 6)
            this.vertices.push(points[0].position, points[4].position, points[5].position);

    }

    getTrianglePositions() {
        return this.vertices.reduce((array, vertex) => {
            array.push(vertex.x, vertex.y)
            return array
        }, [])
    }
}

class SquareGrid {
    constructor(map, squareSize) {
        var nodeCountX = map.length;
        var nodeCountY = map[0].length;
        var mapWidth = nodeCountX * squareSize;
        var mapHeight = nodeCountY * squareSize;

        var controlNodes = createArray(nodeCountX, nodeCountY);

        // Convert every point from the original map and convert it to a node with an appropriate position
        for (var x = 0; x < nodeCountX; x++) {
            for (var y = 0; y < nodeCountY; y++) {
                var pos = new Vec(-mapWidth / 2.0 + x * squareSize + squareSize / 2.0, -mapHeight / 2.0 + y * squareSize + squareSize / 2.0, 0);
                controlNodes[x][y] = new Node(pos, map[x][y] == 1, squareSize);
            }
        }

        // Convert such array of control nodes to an array made from squares
        this.squares = createArray(nodeCountX - 1, nodeCountY - 1);
        for (var x = 0; x < nodeCountX - 1; x++) {
            for (var y = 0; y < nodeCountY - 1; y++) {
                this.squares[x][y] = new Square(controlNodes[x][y + 1], controlNodes[x + 1][y + 1], controlNodes[x + 1][y], controlNodes[x][y]);
            }
        }
    }
}

// Square class containing positions of 8 points surrounding it
class Square {
    constructor(_topLeft, _topRight, _bottomRight, _bottomLeft) {
        this.topLeft = _topLeft;
        this.topRight = _topRight;
        this.bottomRight = _bottomRight;
        this.bottomLeft = _bottomLeft;

        this.centreTop = this.topLeft.right;
        this.centreRight = this.bottomRight.above;
        this.centreBottom = this.bottomLeft.right;
        this.centreLeft = this.bottomLeft.above;

        this.configuration = 0
        if (this.topLeft.active)
            this.configuration += 8;
        if (this.topRight.active)
            this.configuration += 4;
        if (this.bottomRight.active)
            this.configuration += 2;
        if (this.bottomLeft.active)
            this.configuration += 1;
    }

}

class Node {
    constructor(pos, active, squareSize) {
        this.active = active
        this.position = pos
        this.above = { position: new Vec(pos.x, pos.y + squareSize / 2.0, 0) }
        this.right = { position: new Vec(pos.x + squareSize / 2.0, pos.y, 0) }
    }
}

export class Vec {
    constructor(x, y, z) {
        this.x = x
        this.y = y
        this.z = z
    }
}
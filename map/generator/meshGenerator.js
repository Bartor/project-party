class MeshGenerator {
    constructor(map, squareSize) {
        this.squareGrid = new SquareGrid(map, squareSize)
        this.vertices = []
        this.vertices2 = []
        
        this.triangleDictionary = new Map();    // vertexIndex -> [triangles]
        this.outlines = []
        this.checkedVertices = []
        this.vertexIndices  = new Map(); // vertexIndex - > Vector

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
                this.meshFromPoints(square.centreLeft, square.centreBottom, square.bottomLeft);
                break;
            case 2:
                this.meshFromPoints(square.bottomRight, square.centreBottom, square.centreRight);
                break;
            case 4:
                this.meshFromPoints(square.topRight, square.centreRight, square.centreTop);
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
        this.assignVertices(points)
        // Add points representing triangles
        if (points.length >= 3)
            this.createTriangle(points[0].position, points[1].position, points[2].position);
        if (points.length >= 4)
            this.createTriangle(points[0].position, points[2].position, points[3].position);
        if (points.length >= 5)
            this.createTriangle(points[0].position, points[3].position, points[4].position);
        if (points.length >= 6)
            this.createTriangle(points[0].position, points[4].position, points[5].position);

    }

    getTrianglePositions() {
        return this.vertices.reduce((array, vertex) => {
            array.push(vertex.x, vertex.y)
            return array
        }, [])
    }

    createTriangle(a, b, c) {
        this.vertices.push(a,b,c)
        var triangle = new Triangle(this.vertexIndices.get(a), this.vertexIndices.get(b), this.vertexIndices.get(c))
        this.addTriangleToDictionary(triangle.vertexIndexA, triangle)
        this.addTriangleToDictionary(triangle.vertexIndexB, triangle)
        this.addTriangleToDictionary(triangle.vertexIndexC, triangle)
    }

    assignVertices(points) {
        for (var i=0; i< points.length; i+=1) {
            //if not exists in map
            if (!this.vertexIndices.has(points[i].position) ){
                this.vertexIndices.set(points[i].position, this.vertices2.length)
                this.vertices2.push(points[i].position)
            }
        }
    }

    addTriangleToDictionary(vertexIndexKey, triangle){
        if (this.triangleDictionary.has(vertexIndexKey)){
            var triang = this.triangleDictionary.get(vertexIndexKey)
            triang.push(triangle)
            this.triangleDictionary.set(vertexIndexKey, triang)
        } else {
            var triangleList = [triangle]
            this.triangleDictionary.set(vertexIndexKey, triangleList)
        }
    }

    //returns array of lists of consecutive vectors of walls of each shape 
    calculateOutlines() {
        for ( var vertexIndex = 0; vertexIndex < this.vertices2.length; vertexIndex +=1){
            if (!this.checkedVertices.includes(vertexIndex)) {
                var newOutlineVertex = this.getConnectedOutlineVertex(vertexIndex)
 
                if (newOutlineVertex != -1){
                    this.checkedVertices.push(vertexIndex)
                    var newOutline=[vertexIndex]
                    this.outlines.push(newOutline)
                    this.followOutline(newOutlineVertex, this.outlines.length-1)
                    this.outlines[this.outlines.length-1].push(vertexIndex)
                }
            }
        }
        return this.outlinePoints()
    }

    getConnectedOutlineVertex(vertexIndex){
        var trianglesContainingVertex = this.triangleDictionary.get(vertexIndex)
        for (var k=0; k<trianglesContainingVertex.length; k++){
            for (var i=0; i<3; i+=1){
                var vertexB = trianglesContainingVertex[k].vertices[i]
                if (vertexB != vertexIndex && !this.checkedVertices.includes(vertexB)){
                     if (this.isOutlineEdge(vertexIndex, vertexB)) {
                        return vertexB
                    }
                }
            }
        }
        return -1
    }

    //checks whether line between A and B is an outline
    isOutlineEdge(vertexA, vertexB){
        var trianglesContainingVertexA = this.triangleDictionary.get(vertexA)
        var sharedTriangleCount = 0
        for (var i=0; i < trianglesContainingVertexA.length; i++) {
            if ( trianglesContainingVertexA[i].containsVert(vertexB) ) {
                sharedTriangleCount+=1
                if ( sharedTriangleCount > 1) {
                    break
                }
            }
        }
        return sharedTriangleCount === 1
    }

    //translates vector indices into (x,y)-coordinates
    outlinePoints(){
        var revDict = new Map()
        var iterator = this.vertexIndices.entries()
        for (var val of iterator){
            revDict.set(val[1], val[0])
        }
        var outP = []
        for(var i=0; i<this.outlines.length; i++){
            outP.push(this.outlines[i].map(x=> {
                var p = revDict.get(x)
                return { x: p.x, y: p.y }
            }))
        }
        return outP
    }

    //recursive function searching for a next vertex of an outline
    followOutline(vertexIndex, outlineIndex){
        this.outlines[outlineIndex].push(vertexIndex)
        this.checkedVertices.push(vertexIndex)
        var nextVertexIndex = this.getConnectedOutlineVertex(vertexIndex)
        if (nextVertexIndex!=-1){
            this.followOutline(nextVertexIndex, outlineIndex)
        }
    }
}

class SquareGrid {
    constructor(map, squareSize) {
        var nodeCountX = map.length;
        var nodeCountY = map[0].length;
        var mapWidth = nodeCountX * squareSize;
        var mapHeight = nodeCountY * squareSize;

        var controlNodes = [...Array(nodeCountX)].map(x => Array(nodeCountY).fill(null)) 

        // Convert every point from the original map and convert it to a node with an appropriate position
        for (var x = 0; x < nodeCountX; x++) {
            for (var y = 0; y < nodeCountY; y++) {
                var pos = new Vec(x * squareSize + squareSize / 2.0, y * squareSize + squareSize / 2.0, 0);
                controlNodes[x][y] = new Node(pos, map[x][y] == 1, squareSize);
            }
        }

        // Convert such array of control nodes to an array made from squares
        this.squares = [...Array(nodeCountX - 1)].map(x => Array(nodeCountY - 1).fill(null))
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

class Triangle {
    constructor(a, b, c){
        this.vertexIndexA = a
        this.vertexIndexB = b
        this.vertexIndexC = c
        this.vertices = [a, b, c]
    }

    containsVert(vertexIndex) {
        return vertexIndex === this.vertexIndexA || vertexIndex === this.vertexIndexB || vertexIndex === this.vertexIndexC
    }
}

class Vec {
    constructor(x, y, z) {
        this.x = x
        this.y = y
        this.z = z
    }
}

module.exports = MeshGenerator
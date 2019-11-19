export class ProjectParty {
    constructor(container) {
        this.app = new PIXI.Application({
            antialias: true
        });
        container.appendChild(this.app.view);
    }

    addPlayer(player) {
        this.app.stage.addChild(player);
    }
}

export class Player {
    constructor(name, color, size) {
        this.name = name;

        this.graphics = new PIXI.Graphics();
        this.graphics.beginFill(0xffffff);
        this.graphics.drawCircle(size/2, size/2, size);
        this.graphics.endFill();
        this.graphics.beginFill(0xffffff);
        this.graphics.drawPolygon(-size, -size, -1.15*size, 0.25*size, 0.25*size, -1.15*size);
        this.graphics.endFill();
        this.graphics.lineStyle(size/4, 0xffffff);
        this.graphics.drawCircle(size/2, size/2, 1.5*size);
        this.graphics.endFill();

        this.graphics.rotation = Math.PI/4;
    }

    toPosition(x, y) {
        this.graphics.x = x;
        this.graphics.y = y;
        return this;
    }

    toRotation(rotation) {
        this.graphics.rotation = rotation + Math.PI/4;
        return this;
    }

    getGraphics() {
        return this.graphics;
    }
}

export class Obstacle {
    constructor(vertices) {
        this.graphics = new PIXI.Graphics();
        this.graphics.beginFill(0xffffff);
        this.graphics.drawPolygon(vertices);
        this.graphics.endFill();
    }
}
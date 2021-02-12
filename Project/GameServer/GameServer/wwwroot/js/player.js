class Player {
    constructor(canvas, context, x, y) {
        this.canvas = canvas;
        this.context = context;
        this.x = x;
        this.y = y;
        this.movingRight = false;
        this.movingLeft = false;
        this.velocityX = 0;
        this.velocityY = 0;
        this.jumped = false;
        this.id = Math.random();
        this.width = 72;
        this.height = 90;
        this.texture = null;
        this.game = null;
        this.health = 100;
        this.numberOfBalls = 3;
    }

    setGameAndTexture(game, texture) {
        this.game = game;
        this.texture = texture;
    }

    addBall() {
        this.numberOfBalls++;
    }

    draw() {
        if (this.texture == null) {
            this.context.fillStyle = 'white';
            this.context.fillRect(this.x, this.y, this.width, this.height);
        } else {
            this.context.drawImage(this.texture, this.x, this.y, this.width, this.height);
        }

        if (this.x < this.canvas.width / 2) {
            this.context.fillStyle = 'red';
            this.context.fillRect(10, 10, 300 * (this.health / 100), 30);
            this.context.font = "30px Arial";
            this.context.strokeText(this.numberOfBalls.toString(), 10, 100);
        } else {
            this.context.fillStyle = 'red';
            this.context.fillRect(this.canvas.width - 10, 10, -300 * (this.health / 100), 30);
            this.context.font = "30px Arial";
            this.context.strokeText(this.numberOfBalls.toString(), this.canvas.width - 10, 100);
        }
    }

    update() {
        this.friction();
        if (this.jumped) {
            this.jumped = false;

            if (this.y + this.height == this.canvas.height || this.sitsOnStructures()) {
                this.velocityY = -15;
            }

        }
        if (this.movingLeft) {
            this.movingLeft = false;
            this.velocityX = -5;
        }
        if (this.movingRight) {
            this.movingRight = false;
            this.velocityX = 5;
        }

        this.x += this.velocityX;
        this.y += this.velocityY;

        this.gravitation();
        this.checkCollision();
    }

    gravitation() {
        if (this.y + this.height >= this.canvas.height) {
            this.velocityY = 0;
            this.y = this.canvas.height - this.height;
        } else {
            this.velocityY += 0.5;
        }
    }

    friction() {
        if (Math.abs(this.velocityX) <= 0.5) {
            this.velocityX = 0;
        }
        if (this.velocityX > 0) {
            this.velocityX -= 0.2;
        } else if (this.velocityX < 0) {
            this.velocityX += 0.2;
        }
    }

    input(key) {
        if (key == 87) {
            this.jumped = true;
        }
        if (key == 83) {

        }
        if (key == 68) {
            this.movingRight = true;
        }
        if (key == 65) {
            this.movingLeft = true;
        }
    }

    isDead() {
        return this.health <= 0;
    }

    takeHit(damage) {
        this.health -= damage;
    }

    checkCollision() {
        this.game.structures.forEach(structure => {
            if (this.isCollision(structure)) {
                this.x -= this.velocityX;
                if (this.isCollision(structure)) {

                    this.y -= this.velocityY;
                    this.velocityY = -this.minimize(this.velocityY);
                } else {
                }
            }
        });
    }

    isCollision(entity) {
        var x1 = entity.x;
        var y1 = entity.y;
        var x2 = entity.x + entity.width;
        var y2 = entity.y + entity.height;
        var pX1 = this.x;
        var pY1 = this.y;
        var pX2 = this.x + this.width;
        var pY2 = this.y + this.height;

        return !(x2 <= pX1 || x1 >= pX2 || y1 >= pY2 || y2 <= pY1);
    }

    sitsOnStructures() {
        var result = false;
        this.game.structures.forEach(structure => {
            if (this.between(structure.y - (this.y + this.height), -1, 1)
                && (this.between(this.x, structure.x + 5, structure.x + structure.width - 5)
                    || this.between(this.x + this.width, structure.x + 5, structure.x + structure.width - 5)
                    || this.between(this.x + this.width / 2, structure.x + 5, structure.x + structure.width - 5))) {
                result = true;
            }
        });

        return result;
    }

    between(point, begin, end) {
        return point >= begin && point <= end;
    }

    shoot(startingPosition, targetPosition) {
        if (this.numberOfBalls > 0) {
            var projectile = new Projectile(this.canvas, this.context, this.game, startingPosition.x, startingPosition.y, targetPosition.x, targetPosition.y, this.id);

            this.game.entities.push(projectile);
            this.numberOfBalls -= 1;
        }
    }

    minimize(value) {
        if (value <= 3 && value >= -3) {
            return 0;
        }
        return (value / 4);
    }
}
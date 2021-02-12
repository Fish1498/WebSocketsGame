class Projectile {
    constructor(canvas, context, game, x, y, targetX, targetY, creatorId) {
        this.canvas = canvas;
        this.context = context;
        this.x = x;
        this.y = y;
        this.velocityX = (targetX - x) / 30;
        this.velocityY = (targetY - y) / 30;
        this.bounces = 0;
        this.creatorId = creatorId;
        this.game = game;
        this.itHit = false;
        this.radius = 10;
        this.bouncesBeforeDeath = 5;
    }

    isDead() {
        return this.bounces > this.bouncesBeforeDeath || this.itHit;
    }

    draw() {
        this.context.beginPath();
        this.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        this.context.fillStyle = 'white';
        this.context.fill();
        this.context.lineWidth = 5;
        this.context.stroke();
    }

    update() {
        if (this.context.tick % 2 == 0) {
            return;
        }

        if (this.y >= this.canvas.height) {
            this.velocityY = -this.velocityY;
            this.bounces++;
        }

        if (this.y <= 0) {
            this.velocityY = -this.velocityY;
            this.bounces++;
        }

        if (this.x >= this.canvas.width) {
            this.velocityX = -this.velocityX;
            this.bounces++;
        }

        if (this.x <= 0) {
            this.velocityX = -this.velocityX;
            this.bounces++;
        }


        this.velocityY += 0.25;

        this.x += this.velocityX;
        this.y += this.velocityY;

        this.checkCollision();
    }

    checkCollision() {
        this.game.players.forEach(player => {
            if (this.isCollision(player) && (this.creatorId != player.id || (this.creatorId == player.id && this.bounces > 1))) {
                player.takeHit();
                this.itHit = true;
            }
        });

        this.game.structures.forEach(structure => {
            if (structure.bulletHittable && this.isCollision(structure)) {
                this.x -= this.velocityX;
                
                if (this.isCollision(structure)) {
                    this.velocityY = -this.velocityY;
                    this.y += this.velocityY;
                } else {
                    this.velocityX = -this.velocityX;
                    this.x += this.velocityX;
                }
            }
        });
    }

    isCollision(entity) {
        var x1 = entity.x;
        var y1 = entity.y;
        var x4 = entity.x + entity.width;
        var y4 = entity.y + entity.height;

        return !(this.y < y1 || this.x < x1 || this.x > x4 || this.y > y4);
    }
}
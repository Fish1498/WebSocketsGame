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
        this.damage = 25;
        this.stopped = false;
        this.shadows = [];
    }

    isDead() {
        //return this.bounces > this.bouncesBeforeDeath || this.itHit;
        return this.itHit;
    }

    draw() {
        var count = 20;
        if (!this.stopped) {
            for (var i = 0; i < this.shadows.length; i++) {
                count--;
                if (count == 0) {
                    break;
                }
                this.context.beginPath();
                this.context.arc(this.shadows[i].x, this.shadows[i].y, this.radius * (count / 20.0), 0, (2 * Math.PI), false);
                this.context.fillStyle = this.shadows[i].color;
                this.context.fill();
                this.context.lineWidth = 2;
                this.context.stroke();
            };
        }

        this.context.beginPath();
        this.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        this.context.fillStyle = 'rgb(230,' + this.getGreenCoefficient() + ',50)';
        this.context.fill();
        this.context.lineWidth = 2;
        this.context.stroke();
    }

    getGreenCoefficient() {
        var speed = Math.abs(this.velocityX) + Math.abs(this.velocityY);

        if (speed >= 40) {
            return 50;
        } else if (speed <= 20) {
            return 250;
        }

        return 50 + 200 * (40 - speed) / 20;
    }

    update() {
        if (this.context.tick % 2 == 0) {
            return;
        }

        if (!this.stopped) {
            this.shadows.unshift({ x: this.x, y: this.y, color: 'rgb(230,' + this.getGreenCoefficient() + ',50)' });
        }

        if (this.y >= this.canvas.height) {
            this.velocityY = -this.velocityY;
            this.bounces++;
            this.damage *= 0.7;

            this.checkIsStopped();
        }

        if (this.y <= 0) {
            this.velocityY = -this.velocityY;
            this.bounces++;
            this.damage *= 0.7;
        }

        if (this.x >= this.canvas.width) {
            this.velocityX = -this.velocityX;
            this.bounces++;
            this.damage *= 0.7;
        }

        if (this.x <= 0) {
            this.velocityX = -this.velocityX;
            this.bounces++;
            this.damage *= 0.7;
        }

        if (!this.stopped) {
            this.velocityY += 0.25;
            if (this.velocityX > 0) {
                this.velocityX -= 0.005;
            } else {
                this.velocityX += 0.005;
            }
        }

        this.x += this.velocityX;
        this.y += this.velocityY;

        this.checkCollision();
    }

    checkCollision() {
        this.game.players.forEach(player => {
            if (this.isCollision(player) && (this.creatorId != player.id || (this.creatorId == player.id && this.bounces > 1))) {
                if (!this.stopped)
                    player.takeHit(this.damage);
                player.addBall();
                this.itHit = true;
            }
        });

        this.game.structures.forEach(structure => {
            if (structure.bulletHittable && this.isCollision(structure)) {
                this.x -= this.velocityX;
                this.damage *= 0.7;
                this.bounces++;

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

    checkIsStopped() {
        if (this.bounces >= 3) {
            this.velocityX = 0;
            this.velocityY = 0;
            this.y -= this.radius;
            this.stopped = true;
        }
    }
}
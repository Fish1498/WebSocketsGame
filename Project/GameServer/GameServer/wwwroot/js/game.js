class Game {
    constructor(canvas, context, player, webSocket) {
        this.canvas = canvas;
        this.context = context;
        this.ready = true;
        this.keys = {};
        this.entities = [];
        this.context.tick = 0;
        this.player = player;
        this.players = [];
        this.enemy = null;
        this.playerKeys = [];
        this.enemyKeys = [];
        this.textures = [];
        this.structures = [];
        this.state = 0;
        this.stateButtons = [];
        this.webSocket = webSocket;
        this.intervalId = 0;
        this.loadingProjectiles = [];
        this.endingProjectiles = [];
        this.isWinner = true;
    }

    async init() {
        this.loadTextures();
        this.loadStructures();
        this.loadStateButtons();

        this.isReady = true;
    }

    draw() {
        this.context.fillStyle = 'rgb(242,244,142)';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.state == 0) {
            this.stateButtons[0].forEach(button => {
                button.draw();
            });
        } else if (this.state == 1) {
            this.structures.forEach(structure => structure.draw())
            this.entities.forEach(entity => entity.draw());

            this.player.draw();
            if (this.enemy != null) {
                this.enemy.draw();
            }
        } else if (this.state == 2) {
            this.structures.forEach(structure => structure.draw())

            this.endingProjectiles.forEach(projectile => {
                projectile.draw();
            });

            this.stateButtons[2][0].draw();
            this.stateButtons[2][this.isWinner ? 1 : 2].draw();
        } else if (this.state == 3) {
            this.structures.forEach(structure => structure.draw())

            this.loadingProjectiles.forEach(projectile => {
                projectile.draw();
            });
            this.stateButtons[3].forEach(button => {
                button.draw();
            });
        }
    }

    update() {
        this.context.tick++;

        if (this.state == 0) {
        } else if (this.state == 1) {
            this.applyInput();

            this.player.update();
            this.enemy.update();
            if (this.player.isDead() || this.enemy.isDead()) {
                this.fightFinished();
            }

            for (var i = 0; i < this.entities.length; i++) {
                this.entities[i].update();
                if (this.entities[i].isDead()) {
                    this.entities.splice(i, 1);
                    i--;
                }
            }
        } else if (this.state == 2) {
            const spawnTick = 75;

            if (this.context.tick % spawnTick == 0) {
                var x = this.getRandom(0, this.canvas.width - 1);
                var y = this.getRandom(0, this.canvas.height - 1);
                var tX = this.getRandom(x - 350, x + 350);
                var tY = this.getRandom(y - 350, y + 350);
                this.endingProjectiles.push(new Projectile(this.canvas, this.context, this, x, y, tX, tY, 0));
            }

            for (var i = 0; i < this.endingProjectiles.length; i++) {
                this.endingProjectiles[i].update();
                if (this.endingProjectiles[i].stopped) {
                    this.endingProjectiles.splice(i, 1);
                    i--;
                }
            }
        } else if (this.state == 3) {
            const spawnTick = 75;

            if (this.context.tick % spawnTick == 0) {
                var x = this.getRandom(0, this.canvas.width - 1);
                var y = this.getRandom(0, this.canvas.height - 1);
                var tX = this.getRandom(x - 350, x + 350);
                var tY = this.getRandom(y - 350, y + 350);
                this.loadingProjectiles.push(new Projectile(this.canvas, this.context, this, x, y, tX, tY, 0));
            }

            for (var i = 0; i < this.loadingProjectiles.length; i++) {
                this.loadingProjectiles[i].update();
                if (this.loadingProjectiles[i].stopped) {
                    this.loadingProjectiles.splice(i, 1);
                    i--;
                }
            }
        }
    }

    getRandom(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    fightFinished() {
        this.isWinner = !this.player.isDead();
        this.setState(2);
        window.clearInterval(this.intervalId);
        this.webSocket.close();
        this.entities = [];
    }

    applyInput() {
        this.playerKeys.forEach(key => {
            this.player.input(key);
        });

        this.enemyKeys.forEach(key => {
            this.enemy.input(key);
        });
    }

    playerInput(key) {
        this.input(this.playerKeys, key);
    }

    enemyInput(key) {
        this.input(this.enemyKeys, key);
    }

    input(keys, key) {
        if (key > 0) {
            const index = keys.indexOf(key);
            if (index == -1) {
                keys.push(key);
            }
        }
        else {
            const index = keys.indexOf(-key);
            if (index > -1) {
                keys.splice(index, 1);
            }
        }
    }

    playerMouseInput(click) {
        this.mouseInput(this.player, click, null);
    }

    enemyMouseInput(click, startingPosition) {
        this.mouseInput(this.enemy, click, startingPosition);
    }

    updateEnemy(info) {
        this.enemy.x = info.position.x;
        this.enemy.y = info.position.y;
        this.enemy.health = info.health;
    }

    mouseInput(entity, click, startingPosition) {
        if (this.state == 0) {
            this.stateButtons[0].forEach(button => {
                if (button.isHit(click.x, click.y)) {
                    button.action(this);
                }
            });
        } else if (this.state == 1) {
            if (startingPosition == null) {
                startingPosition = { x: entity.x, y: entity.y };
            }

            entity.shoot(startingPosition, click);
        } else if (this.state == 2) {
            this.stateButtons[2].forEach(button => {
                if (button.isHit(click.x, click.y)) {
                    button.action(this, !this.player.isDead());
                }
            });
        }
    }

    async loadTextures() {
        let texture = new Image();
        texture.src = '../assets/player.png';
        this.textures.push(texture);

        texture = new Image();
        texture.src = '../assets/opponent.png';
        this.textures.push(texture);

        texture = new Image();
        texture.src = '../assets/start.png';
        this.textures.push(texture);

        texture = new Image();
        texture.src = '../assets/help.png';
        this.textures.push(texture);

        texture = new Image();
        texture.src = '../assets/loading.png';
        this.textures.push(texture);

        texture = new Image();
        texture.src = '../assets/back.png';
        this.textures.push(texture);

        texture = new Image();
        texture.src = '../assets/won.png';
        this.textures.push(texture);

        texture = new Image();
        texture.src = '../assets/lost.png';
        this.textures.push(texture);

        this.player.setGameAndTexture(this, this.textures[0]);
    }

    async loadStateButtons() {
        var startButton = new Button(this.canvas, this.context, this, (this.canvas.width / 2) - 100, (this.canvas.height / 2), 200, 50, (game) => {
            this.setState(3);
            this.webSocket.create(this);
        }, this.textures[2]);
        var helpButton = new Button(this.canvas, this.context, this, (this.canvas.width / 2) - 100, (this.canvas.height / 2) + 100, 200, 50, (game) => {
            console.log("Help");
        }, this.textures[3]);

        this.stateButtons.push([startButton, helpButton]);
        this.stateButtons.push([]);

        var wonButton = new Button(this.canvas, this.context, this, (this.canvas.width / 2) - 100, (this.canvas.height / 2), 200, 50, (game) => {
        }, this.textures[6]);
        var lostButton = new Button(this.canvas, this.context, this, (this.canvas.width / 2) - 100, (this.canvas.height / 2), 200, 50, (game) => {
        }, this.textures[7]);
        var goBackButton = new Button(this.canvas, this.context, this, (this.canvas.width / 2) - 100, (this.canvas.height / 2) + 100, 200, 50, (game) => {
            this.setState(0);
        }, this.textures[5]);

        this.stateButtons.push([goBackButton, wonButton, lostButton]);

        var loadingButton = new Button(this.canvas, this.context, this, (this.canvas.width / 2) - 100, (this.canvas.height / 2), 200, 50, (game) => {}, this.textures[4]);

        this.stateButtons.push([loadingButton]);
    }

    async loadStructures() {
        this.structures = [];
        if (this.state == 0) {
        } else if (this.state == 1) {
            this.structures.push(new Structure(this.canvas, this.context, this, 475, 650, 50, 150, true, true));
            this.structures.push(new Structure(this.canvas, this.context, this, 475, 0, 50, 800, false, false));
        } else if (this.state == 2) {
            this.structures.push(new Structure(this.canvas, this.context, this, (this.canvas.width / 2) - 100, (this.canvas.height / 2), 200, 50, false, true));
            this.structures.push(new Structure(this.canvas, this.context, this, (this.canvas.width / 2) - 100, (this.canvas.height / 2) + 100, 200, 50, false, true));
        } else if (this.state == 3) {
            this.structures.push(new Structure(this.canvas, this.context, this, (this.canvas.width / 2) - 100, (this.canvas.height / 2), 200, 50, false, true));
        }
    }

    startFight(message) {
        this.enemy = new Player(this.canvas, this.context, this.canvas.width - 50, 0);
        if (message == "1") {
            this.player.x = 50;
            this.player.y = 0;
        } else {
            this.player.x = this.canvas.width - 50;
            this.player.y = 0;
            this.enemy.x = 50;
            this.enemy.y = 0;
        }

        this.enemy.setGameAndTexture(this, this.textures[1]);
        this.enemyKeys = [];
        this.players = [this.player, this.enemy];
        this.setState(1);
        this.loadingProjectiles = [];
        this.endingProjectiles = [];
        var game = this;

        this.intervalId = window.setInterval(() => {
            var value = { position: { x: game.player.x, y: game.player.y }, health: game.player.health };
            game.webSocket.send(new Event(EventType.Info, value));
        }, 500);
    }

    setState(state){
        this.state = state;
        this.loadStructures();
    }
}

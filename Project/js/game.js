class Game {
    constructor(canvas, context, playerOne, playerTwo) {
        this.canvas = canvas;
        this.context = context;
        this.ready = true;
        this.keys = {};
        this.entities = [];
        this.context.tick = 0;
        this.players = [playerOne, playerTwo];
        this.keys[playerOne.id] = [];
        this.keys[playerTwo.id] = [];
        this.textures = [];
        this.structures = [];
    }


    async init() {
        this.loadTextures();
        this.loadStructures();

        this.isReady = true;
    }

    draw() {
        this.context.fillStyle = 'cyan';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.structures.forEach(structure => structure.draw())
        this.players.forEach(player => player.draw());
        this.entities.forEach(entity => entity.draw());
    }

    update() {
        this.context.tick++;

        this.applyInput();

        for (var i = 0; i < this.players.length; i++) {
            this.players[i].update();
            if (this.players[i].isDead()) {
                this.players.splice(i, 1);
                i--;
            }
        }

        for (var i = 0; i < this.entities.length; i++) {
            this.entities[i].update();
            if (this.entities[i].isDead()) {
                this.entities.splice(i, 1);
                i--;
            }
        }
    }

    applyInput() {
        for (var id in this.keys) {
            var playerKeys = this.keys[id];
            var player = this.getPlayerById(id);
            if (!player) continue;

            playerKeys.forEach(key => {
                player.input(key);
            });
        }
    }

    input(key, id) {
        var playerKeys = this.keys[id]

        if (key > 0) {
            const index = playerKeys.indexOf(key);
            if (index == -1) {
                playerKeys.push(key);
            }
        }
        else {
            const index = playerKeys.indexOf(-key);
            if (index > -1) {
                playerKeys.splice(index, 1);
            }
        }
    }

    mouseInput(click, id) {
        var player = this.getPlayerById(id);
        if (!player) return;

        var projectile = new Projectile(this.canvas, this.context, this, player.x, player.y, click.x, click.y, player.id);

        this.entities.push(projectile);
    }

    getPlayerById(id) {
        for (var i = 0; i < this.players.length; i++) {
            if (this.players[i].id == id) {
                return this.players[i];
            }
        }
    }

    async loadTextures() {
        let texture = new Image();
        texture.src = '../assets/player.png';
        this.textures.push(texture);

        texture = new Image();
        texture.src = '../assets/opponent.png';
        this.textures.push(texture);

        this.players[0].setGameAndTexture(this, this.textures[0]);
        this.players[1].setGameAndTexture(this, this.textures[1]);
    }

    async loadStructures() {
        this.structures.push(new Structure(this.canvas, this.context, this, 475, 650, 50, 150, true, true));
        this.structures.push(new Structure(this.canvas, this.context, this, 475, 0, 50, 800, false, false));
        this.structures.push(new Structure(this.canvas, this.context, this, 100, 600, 200, 50, true, true));
    }
}

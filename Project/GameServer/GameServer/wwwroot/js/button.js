class Button {
    constructor(canvas, context, game, x, y, width, height, action, texture) {
        this.canvas = canvas;
        this.context = context;
        this.x = x;
        this.y = y;
        this.game = game;
        this.width = width;
        this.height = height;
        this.action = action;
        this.texture = texture;
    }

    draw() {
        if (this.texture == null) {
            this.context.fillStyle = 'blue';
            this.context.fillRect(this.x, this.y, this.width, this.height);
        } else {
            this.context.drawImage(this.texture, this.x, this.y, this.width, this.height);
        }
    }

    update() {
    }

    isHit(x,y) {
        var x1 = this.x;
        var y1 = this.y;
        var x4 = this.x + this.width;
        var y4 = this.y + this.height;

        return !(y < y1 || x < x1 || x > x4 || y > y4);
    }
}
class Structure {
    constructor(canvas, context, game, x, y, width, height, visible, bulletHittable) {
        this.canvas = canvas;
        this.context = context;
        this.x = x;
        this.y = y;
        this.game = game;
        this.width = width;
        this.height = height;
        this.visible = visible;
        this.bulletHittable = bulletHittable;
    }

    draw() {
        if(this.visible){
            this.context.fillStyle = 'red';
            this.context.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    update() {
    }
}
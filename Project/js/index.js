var canvas = document.getElementById('game');
var context = canvas.getContext('2d');

var playerOne = new Player(canvas, context, 50, 0);
var playerTwo = new Player(canvas, context, this.canvas.width - 100, 0);

var game = new Game(canvas, context, playerOne, playerTwo);
game.init();

function gameRunner(game) {
	game.update();
	game.draw();
	setTimeout(function () {
		gameRunner(game);
	}, 8);
}

gameRunner(game);

window.addEventListener('keydown', this.onKeyDown, false);
window.addEventListener('keyup', this.onKeyUp, false);

canvas.addEventListener(
	'click',
	function (event) {
		game.mouseInput(event, playerOne.id);
	},
	false
);

function onKeyDown(e) {
	game.input(e.keyCode, playerOne.id);
}

function onKeyUp(e) {
	game.input(-e.keyCode, playerOne.id);
}
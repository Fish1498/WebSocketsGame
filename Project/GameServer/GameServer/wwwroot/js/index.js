var canvas = document.getElementById('game');
var context = canvas.getContext('2d');

var player = new Player(canvas, context, 50, 0);
var webSocket = new WebSocketManager();
var game = new Game(canvas, context, player, webSocket);
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
		mouseWrapper(event);
	},
	false
);

function onKeyDown(e) {
	keyWrapper(e.keyCode);
}

function onKeyUp(e) {
	keyWrapper(-e.keyCode);
}

function keyWrapper(keyCode) {
	webSocket.send(new Event(EventType.Key, { keyCode: keyCode }));
	game.playerInput(keyCode);
}

function mouseWrapper(mouseInput) {
	var click = {x: mouseInput.x, y: mouseInput.y, startX: game.player.x, startY: game.player.y};
	webSocket.send(new Event(EventType.Mouse, { click: click }));
	game.playerMouseInput(click);
}
class WebSocketManager {
    constructor() {
        this.url = "wss://localhost:5001/ws";
    }

    create(game) {
        this.created = true;
        this.websocket = new WebSocket(this.url);
        this.websocket.onclose = function (message) { };

        this.websocket.onmessage = function (message) {
            if (message.data == "1" || message.data == "2") {
                game.startFight(message.data);
            } else {
                var deserialized = JSON.parse(message.data);

                switch (deserialized.type) {
                    case EventType.Key:
                        game.enemyInput(deserialized.value.keyCode);
                        break;
                    case EventType.Mouse:
                        var startingPosition = {x: deserialized.value.click.startX, y: deserialized.value.click.startY};
                        game.enemyMouseInput(deserialized.value.click, startingPosition);
                        break;
                    case EventType.Info:
                        game.updateEnemy(deserialized.value);
                        break;
                    default:
                }
            }
        };
    }

    send(message) {
        if(!this.created){
            return;
        }

        this.websocket.send(JSON.stringify(message));
    }

    close() {
        this.created = false;
        this.websocket.close();
    }
}
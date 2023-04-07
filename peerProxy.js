
const { WebSocketServer } = require('ws');
const uuid = require('uuid');
const MESSAGE_TYPES = { joinLobby: 'joinLobby', leaveLobby: 'leaveLobby', startGame: 'startGame', playerTokenPlaced: 'playerTokenPlaced' };

class PeerProxy {
    constructor(httpServer) {
        // Create a WebSocket object
        const wss = new WebSocketServer({ noServer: true });

        // Handle the protocol upgrade from HTTP to WebSocket
        httpServer.on('upgrade', (req, socket, head) => {
            wss.handleUpgrade(req, socket, head, function done(ws) {
                wss.emit('connection', ws, req);
            });
        });

        // Keep track of connections for people in-game
        // connection = { id: uuid, ws: ws, alive: boolean, roomCode: 1234 }
        let connections = [];

        // Implement what happens when a user connects
        wss.on('connection', async (ws) => {
            const connection = { id: uuid.v4(), ws: ws, alive: true, roomCode: null };
            connections.push(connection);

            // Forward messages to everyone in the same lobby except the sender
            ws.on('message', async function message(data) {
                const dataString = String.fromCharCode.apply(null, new Uint16Array(data));
                const message = JSON.parse(dataString);

                if (message.type === MESSAGE_TYPES.joinLobby) {
                    connections.forEach((c) => {
                        if (c.id === connection.id) {
                            c.roomCode = message.roomCode;
                        } else if (c.roomCode === message.roomCode) {
                            c.ws.send(data);
                        }
                    });
                } else {
                    connections.forEach((c) => {
                        if (c.roomCode === message.roomCode) {
                            if (c.id !== connection.id) c.ws.send(data);
                        }
                    });
                }
            });

            // Remove the closed connection so we do not try to forward messages
            ws.on('close', () => {
                connections.findIndex((c, i) => {
                    if (c.id === connection.id) {
                        connections.splice(i, 1);
                        return true;
                    }
                });
            });

            // Respond to pong messages by marking the connection as alive
            ws.on('pong', () => {
                connection.alive = true;
            });
        });

        // Keep active connections alive
        setInterval(() => {
            // Ping the connections that are pending
            connections.forEach((c) => {
                // Kill any connection that did not respond to the ping message
                if (!c.alive) {
                    c.ws.terminate();
                } else {
                    c.alive = false;
                    c.ws.ping();
                }
            });
        }, 10000);
    }    
}

module.exports = { PeerProxy };

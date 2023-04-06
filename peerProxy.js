
const { WebSocketServer } = require('ws');
const uuid = require('uuid');

class PeerProxy {
    MESSAGE_TYPES = { joinLobby: 'joinLobby', leaveLobby: 'leaveLobby', startGame: 'startGame', playerTokenPlaced: 'playerTokenPlaced' };

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
                const message = JSON.parse(await data.data.text());

                if (message.type === MESSAGE_TYPES.joinLobby) {
                    connections.forEach((c) => {
                        if (c.id === connection.id) {
                            c.roomCode = message.roomCode;
                        } else if (c.roomCode === message.roomCode) {
                            c.ws.send(data);
                        }
                    });
                }

                // lobbies.forEach((lobby) => {
                //     // Only send the message to the lobby that the player attempts to connect to
                //     if (message.roomCode === lobby.roomCode) {
                //         lobby.players.forEach((player) => {
                //             if (player.id !== connection.id) {
                //                 player.ws.send(data);
                //             }
                //         });
                //     }
                // });
            });

            // Remove the closed connection so we do not try to forward messages
            ws.on('close', () => {
                // let finished = false;

                // // If the player was in a lobby, then remove them from the lobby
                // lobbies.findIndex((l, i) => {
                //     // See if the player is in the lobby
                //     l.players.findIndex((p, i) => {
                //         if (p.id === connection.id) {
                //             l.players.splice(i, 1);

                //             // If the lobby is left with no players left, close it
                //             if (!l.players.length) {
                //                 lobbies.splice(i, 1);
                //                 database.deleteLobby(l.roomCode);
                //             }

                //             finished = true;
                //             return true;
                //         }
                //     });
                //     return true;
                // });

                // // Otherwise, remove them from pendingConnections
                // if (!finished) {
                //     connections.findIndex((c, i) => {
                //         if (c.id === connection.id) {
                //             connections.splice(i, 1);
                //             return true;
                //         }
                //     });
                // }
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

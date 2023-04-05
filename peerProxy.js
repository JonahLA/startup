
const { WebSocketServer } = require('ws');
const uuid = require('uuid');

const MESSAGE_TYPES = { getLobbies: 'getLobbies', joinLobby: 'joinLobby', leaveLobby: 'leaveLobby', startGame: 'startGame', playerTokenPlaced: 'playerTokenPlaced' };

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

        // Keep track of 1) pendingConnections [or people on the lobby-choice page] and 2) lobbies [or people actually in-game]
        // pendingConnection = { id: uuid, ws: ws, alive: boolean }
        // lobby = { roomCode: 'AB12', hostname: host's username, players: [ connections ] }
        //       TODO: HOSTNAME IS SET WHEN WS://createLobby (or event with type=createLobby)
        let pendingConnections = [];
        let lobbies = [];

        // Implement what happens when a user connects
        wss.on('connection', (ws) => {
            const connection = { id: uuid.v4(), ws: ws, alive: true };
            pendingConnections.push(connection);

            // Forward messages to everyone in the same lobby except the sender
            ws.on('message', async function message(data) {
                const message = JSON.parse(await data.data.text());

                // TODO: FIGURE OUT HOW TO DO THIS SINCE THE PLAYER WILL BE CHANGING PAGES!!! How will they maintain a connection? Do they need to pass data and open a connection???
                if (message.type === MESSAGE_TYPES.getLobbies) {
                    // If the player is asking for the lobby list, then send them back the list of all of the lobbies
                    connection.ws.send(JSON.stringify(lobbies));
                } else if (message.type === MESSAGE_TYPES.joinLobby) {
                    // If the player is joining a lobby, remove them from pendingConnections and add them to the lobby
                    pendingConnections.findIndex((c, i) => {
                        if (c.id === connection.id) {
                            pendingConnections.splice(i, 1);
                            return true;
                        }
                    });

                    lobbies.findIndex((l, i) => {
                        if (l.roomCode === message.roomCode) {
                            l.players.push(connection);
                            return true;
                        }
                    });
                } else if (message.type === MESSAGE_TYPES.leaveLobby) {
                    // If the player is leaving a lobby, remove them from the lobby and add them to the pendingConnections
                    lobbies.findIndex((l, i) => {
                        if (l.roomCode === message.roomCode) {
                            l.players.findIndex((p, i) => {
                                if (p.id === connection.id) {
                                    l.players.splice(i, 1);
                                    return true;
                                }
                            });
                            return true;
                        }
                    });
                    pendingConnections.push(connection);
                }

                lobbies.forEach((lobby) => {
                    // Only send the message to the lobby that the player attempts to connect to
                    if (message.roomCode === lobby.roomCode) {
                        lobby.players.forEach((player) => {
                            if (player.id !== connection.id) {
                                player.ws.send(data);
                            }
                        });
                    }
                });
            });

            // Remove the closed connection so we do not try to forward messages
            ws.on('close', () => {
               // Remove the connection from the pendingConnections 
            });

            // Respond to pong messages by marking the connection as alive
            ws.on('pong', () => {
                connection.alive = true;
            });
        });

        // Keep active connections alive
        setInterval(() => {
            pendingConnections.forEach((c) => {
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

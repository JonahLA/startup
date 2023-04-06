
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const database = require('./database.js');
const bcrypt = require('bcrypt');
const { PeerProxy } = require('./peerProxy.js');

const AUTH_COOKIE_NAME = "token"

// Get the port that we will use OR use a default port
const port = (process.argv.length > 2) ? process.argv[2] : 3000;

// JSON body parsing using built-in middleware
app.use(express.json());

// Set up the middleware to parse cookies
app.use(cookieParser());

// Set up the middleware to serve the static files
app.use(express.static('public'));



/* ==========================
    SET UP OUR API ENDPOINTS
   ==========================
*/
let apiRouter = express.Router();
app.use(`/api`, apiRouter);

// Get username of logged-in user (GET /api/user:username)
apiRouter.get('/user/:username', async (req, res) => {
    const user = await database.getUser(req.params.username);

    // If the user is found, then send a response telling if the user is authenticated or not
    if (user) {
        const token = req?.cookies.token;
        res.send({ username: user.username, authenticated: token === user.token });
    } else {
        // If the user is not found, then send an 404 response
        res.status(404).send({ message: 'Unknown user'});
    }
});

// Register user (POST /api/user/register) { "username": "username", "password": "password" }
apiRouter.post('/user/register', async (req, res) => {
    const user = await database.getUser(req.body.username);

    // If the user already exists in the database, then send a 409 response
    if (user) {
        res.status(409).send({ message: 'Existing user' });
    } else {
        // Otherwise, create the user and set the authToken
        const registeredUser = await database.createUser({ username: req.body.username, password: req.body.password });
        setAuthCookie(res, registeredUser.token);
        res.send({ username: registeredUser.username });
    }
});

// Login user (POST /api/user/login) { "username": "username", "password": "password" }
apiRouter.post('/user/login', async (req, res) => {
    const user = await database.getUser(req.body.username);

    // If the user is found, then check if the passwords match
    if (user) {
        if (await bcrypt.compare(req.body.password, user.password)) {
            setAuthCookie(res, user.token);
            res.send({ id: user._id });
        }
    } else {
        // If the user is not found, then send a 401 response
        res.status(401).send({ message: 'Unauthorized' });
    }
});

// Logout user (DELETE /api/user/logout)
apiRouter.delete('/user/logout', async (_req, res) => {
    res.clearCookie(AUTH_COOKIE_NAME);
    res.status(204).end();
});

// Create a secure router that will authenticate before attempting any of the endpoints
let secureApiRouter = express.Router();
apiRouter.use(secureApiRouter);

secureApiRouter.use(async (req, res, next) => {
    const authToken = req.cookies[AUTH_COOKIE_NAME];
    const user = await database.getUserByToken(authToken);

    // If the user is authenticated, then continue with the endpoint call
    if (user) next();
    else res.status(401).send({ message: 'Unauthorized'});
});

// Get list of lobbies (GET /api/lobby) RESULT: [{ "roomCode": "1234", "hostname": "Kiegan" }, { "roomCode": "A7J8", "hostname": "Jones" }, ...]
secureApiRouter.get('/lobby', async (_req, res) => {
    const lobbies = getLobbies();
    res.send(JSON.stringify(lobbies));
    console.log(`Retrieving list of lobbies`);
});

// Create lobby (POST /api/lobby) REQUEST: { "roomCode": "1234", "hostname": "Kiegan" } RESULT: { "roomCode": "1234", "hostname": "Kiegan" }
secureApiRouter.post('/lobby', async (req, res) => {
    const lobbyData = { roomCode: req.body.roomCode, hostname: req.body.hostname };
    const lobby = openLobby(lobbyData);
    res.send(JSON.stringify(lobby));
    console.log(`Creating lobby(#${req.body.roomCode})`);
});

// Search for lobby (GET /api/lobby/1234) RESULT: { "roomCode": "1234", "hostname": "Kiegan" }
secureApiRouter.get('/lobby/:roomCode', async (req, res) => {
    const roomCode = req.params.roomCode;
    const lobby = getLobby(roomCode);
    if (lobby) res.send(JSON.stringify(lobby));
    else res.status(204).send();
    console.log(`Searched for lobby(#${roomCode}) and found:\n${JSON.stringify(lobby)}`);
});

// Close lobby (DELETE /api/lobby/1234)
secureApiRouter.delete('/lobby/:roomCode', async (req, res) => {
    const roomCode = req.params.roomCode;
    const result = closeLobby(roomCode);
    if (result) res.status(200).send();
    else res.status(400).send();
    console.log(`Closing lobby(#${roomCode})`);
});

// TODO: this documentation
secureApiRouter.post('/lobby/join', (req, res) => {
    const roomCode = req.body.roomCode;
    const username = req.body.username;
    const result = joinLobby(roomCode, username);
    if (result) res.status(200).send();
    else res.status(400).send();
    console.log(`${username} is joining lobby(#${roomCode})`);
});

// TODO: this documentation
secureApiRouter.delete('/lobby/join', (req, res) => {
    const roomCode = req.body.roomCode;
    const username = req.body.username;
    const result = leaveLobby(roomCode, username);
    if (result) res.status(200).send();
    else res.status(400).send();
    console.log(`${username} is leaving lobby(#${roomCode})`);
});



// Default error handler
app.use(function (err, req, res, next) {
    res.status(500).send({ type: err.name, message: err.message });
});

// This is a fall-through middleware that serves the 'index.html' file if the given URL doesn't match anything else
app.use((_req, res) => {
    res.sendFile('index.html', {root: 'public'});
});

// Start listening on the port
const httpServer = app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

new PeerProxy(httpServer);

// Set the authToken in the response
function setAuthCookie(res, authToken) {
    res.cookie(AUTH_COOKIE_NAME, authToken, {
        secure: true,
        httpOnly: true,
        sameSite: 'strict',
    });
}



let lobbies = [];

// Queries the database for available lobbies to join
function getLobbies() {
    let availableLobbies = [];
    lobbies.forEach((lobby) => {
        if (lobby.players.length < 10) availableLobbies.push(lobbies);
    });
    return availableLobbies;
}

// Takes a lobbyData dict and creates a lobby from it
function openLobby(lobbyData) {
    // Check that the roomCode isn't being used already
    lobbies.forEach((lobby) => {
        if (lobby.roomCode === lobbyData.roomCode) throw 'That room code is already being used.';
    });

    // Create a lobby and add it to the list of lobbies
    const lobby = { roomCode: lobbyData.roomCode, hostname: lobbyData.hostname, players: [] };
    lobbies.push(lobby);
    return lobby;
}

// Takes a room code and closes that lobby, returning a boolean indicating whether a lobby with that room code was found
function closeLobby(roomCode) {
    let isFound;
    lobbies.findIndex((lobby, i) => {
        if (lobby.roomCode === roomCode) {
            isFound = true;
            lobbies.splice(i, 1);
            return true;
        }
    });
    return isFound;
}

// Takes a room code and returns that lobby
function getLobby(roomCode) {
    let foundLobby;
    lobbies.forEach((lobby) => {
        if (lobby.roomCode === roomCode) foundLobby = lobby;
    });
    return foundLobby;
}

function joinLobby(roomCode, username) {
    let isSuccessful;
    lobbies.forEach((lobby) => {
        if (lobby.roomCode === roomCode) {
            lobby.players.push(username);
            isSuccessful = true;
        }
    });
    return isSuccessful;
}

function leaveLobby(roomCode, username) {
    let isSuccessful;
    lobbies.forEach((lobby) => {
        if (lobby.roomCode === roomCode) {
            lobby.players.findIndex((player, i) => {
                if (player === username) {
                    lobby.players.splice(i, 1);
                    isSuccessful = true;
                    return true;
                }
            });
        }
    });
    return isSuccessful;
}

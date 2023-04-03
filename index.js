
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const database = require('./database.js');
const bcrypt = require('bcrypt');

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

// Get list of lobbies (GET /api/lobby)
apiRouter.get('/lobby', (_req, res) => {
    res.send({ message: 'Getting lobby list' });
    res.send(JSON.stringify(lobbies));
    console.log(`Retrieving list of lobbies`);
});

// Search for lobby (POST /api/lobby) { "roomCode": "1234" }
apiRouter.post('/lobby', (req, res) => {
    // TODO: attempt to enter lobby given by roomCode
    res.send({ message: 'Trying to join lobby' });
    console.log(`Joining lobby: #${req.body.roomCode}`);
});

// Get user's stats (GET /api/stats?username=[username])
apiRouter.get('/stats/user', (_req, res) => {
    // TODO: retrieve user's stats
    // TODO: figure out how to parse parameter from URI
    res.send({ message: 'Getting stats for current user' });
    console.log(`Getting stats for user`);
});

// Get lobby's stats (GET /stats?room-code=[roomCode]) or (GET /stats)
apiRouter.get('/stats/lobby', (_req, res) => {
    // TODO: retrieve lobby's stats
    // TODO: figure out how to parse parameter from URI
    res.send({ message: 'Getting stats for current lobby' });
    console.log(`Getting stats for lobby`);
});

// Submit game info [from individual client] (POST /stats) { "username": "username", "outcome": "win/loss" }
apiRouter.post('/stats', (req, res) => {
    // TODO: attempt to enter lobby given by roomCode
    res.send({ message: 'Submitting stats for user' });
    console.log(`Submitting stats for ${req.body.username} who got a ${req.body.outcome}`);
});



// This is a fall-through middleware that serves the 'index.html' file if the given URL doesn't match anything else
app.use((_req, res) => {
    res.sendFile('index.html', {root: 'public'});
});

// Start listening on the port
const httpServer = app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

// Set the authToken in the response
function setAuthCookie(res, authToken) {
    res.cookie(AUTH_COOKIE_NAME, authToken, {
      secure: true,
      httpOnly: true,
      sameSite: 'strict',
    });
}



/* ========================================
    CREATE OUR DATA OBJECTS (for temp use)
   ========================================
*/
const TEST_LOBBIES = [
    { hostName: 'Kiegan', roomCode: '1234', occupancy: 7 },
    { hostName: 'Rocky', roomCode: '7264', occupancy: 4},
    { hostName: 'Jameson', roomCode: '9182', occupancy: 3 },
    { hostName: 'Jones', roomCode: '4747', occupancy: 1 },
]

let lobbies = [];
let currentLobby = { hostName: null, roomCode: null, players: [] };

// Queries the database for available lobbies to join
function loadLobbies() {
    // TEMP: atm, we will just load the TEST_LOBBIES
    lobbies = TEST_LOBBIES;
}

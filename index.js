
const express = require('express');
const app = express();

// Get the port that we will use OR use a default port
const port = (process.argv.length > 2) ? process.argv[2] : 3000;

// JSON body parsing using built-in middleware
app.use(express.json());

// Set up the middleware to serve the static files
app.use(express.static('public'));



/* ==========================
    SET UP OUR API ENDPOINTS
   ==========================
*/
let apiRouter = express.Router();
app.use(`/api`, apiRouter);

// THIS IS PURELY FOR DEBUGGING - - this middleware gets called before anything else and then passes it off to the next middleware available
// Think of this like a @BeforeEach from JUnit tests
apiRouter.use((_req, _res, next) => {
    console.log(`The request is being routed.`);
    next();
});

// Register user (POST /user/register) { "username": "username", "password": "password" }
apiRouter.post('/user/register', (req, res) => {
    // TODO: register the user
    res.send({ message: 'Registered user' });
    console.log(`Registered user: ${req.body.username}`);
});

// Login user (POST /user/login) { "username": "username", "password": "password" }
apiRouter.post('/user/login', (req, res) => {
    // TODO: login the user
    res.send({ message: 'Logged in user' });
    console.log(`Logged in user: ${req.body.username}`);
});

// Get list of lobbies (GET /lobby)
apiRouter.get('/lobby', (_req, res) => {
    // TODO: retrieve list of lobbies
    res.send({ message: 'Getting lobby list' });
    console.log(`Retrieving list of lobbies`);
});

// Search for lobby (POST /lobby) { "roomCode": "1234" }
apiRouter.post('/lobby', (req, res) => {
    // TODO: attempt to enter lobby given by roomCode
    res.send({ message: 'Trying to join lobby' });
    console.log(`Joining lobby: #${req.body.roomCode}`);
});

// Get user's stats (GET /stats/[username])
apiRouter.get('/stats/user', (_req, res) => {
    // TODO: retrieve user's stats
    // TODO: figure out how to parse parameter from URI
    res.send({ message: 'Getting stats for current user' });
    console.log(`Getting stats for user`);
});

// Get lobby's stats (GET /stats/[roomCode]) or (GET /stats)
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



// TODO: IS THIS ACTUALLY WHAT THIS DOES??
// This is a fall-through middleware that serves the 'index.html' file if the other middleware didn't catch this
app.use((_req, res) => {
    res.sendFile('index.html', {root: 'public'});
});

// Start listening on the port
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})

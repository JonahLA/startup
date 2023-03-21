
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
// TODO: this lol

// TODO: IS THIS ACTUALLY WHAT THIS DOES??
// This is a fall-through middleware that serves the 'index.html' file if the other middleware didn't catch this
app.use((_req, res) => {
    res.sendFile('index.html', {root: 'public'});
});

// Start listening on the port
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})

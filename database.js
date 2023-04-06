
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const uuid = require('uuid');

const SALT_FACTOR = 10;

// Get credentials from environment
const username = process.env.MONGOUSER;
const password = process.env.MONGOPASS;
const hostname = process.env.MONGOHOST;

if (!username) {
    throw Error('Database not configured. Set environment variables');
}

// Construct URL and connect to the database
const url = `mongodb+srv://${username}:${password}@${hostname}`;

const client = new MongoClient(url);
const userCollection = client.db('startup').collection('users');
const lobbiesCollection = client.db('startup').collection('lobbies');

async function getUser(username) {
    return await userCollection.findOne({ username: username });
}

async function getUserByToken(token) {
    return await userCollection.findOne({ token: token });
}

async function createUser(userData) {
    // Hash the password to store in the database
    const passHash = await bcrypt.hash(userData.password, SALT_FACTOR);

    // Store the user in the database
    const user = { username: userData.username, password: passHash, token: uuid.v4() };
    await userCollection.insertOne(user);

    return user;
}

async function getLobby(roomCode) {
    return await lobbiesCollection.findOne({ roomCode: roomCode });
}

async function getLobbies() {
    return await lobbiesCollection.find().toArray();
}

async function createLobby(lobbyData) {
    // Check to see if there is already a lobby with that roomCode
    const lobbyCheck = await getLobby(lobbyData.roomCode);
    if (lobbyCheck) return { message: 'A lobby with that room code already exists' };

    // Store the lobby's information in the database
    const lobby = { roomCode: lobbyData.roomCode, hostname: lobbyData.hostname };
    await lobbiesCollection.insertOne(lobby);
    return lobby;
}

async function deleteLobby(roomCode) {
    let response;
    try {
        const result = await lobbiesCollection.deleteOne({ roomCode: roomCode }, function(err, obj) {
            if (err) throw err;
            if (obj) print(obj);
        });

        if (result.deletedCount) response = `Successfully deleted lobby with room code: ${roomCode}`;
        else response = `No lobbies with room code: ${roomCode} were found`;
    } catch (e) {
        response = `Error deleting lobby with room code: ${roomCode}`;
    }    
    return response;
}

module.exports = {
    getUser,
    getUserByToken,
    createUser,
    getLobby,
    getLobbies,
    createLobby,
    deleteLobby,
};

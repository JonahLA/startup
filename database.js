
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

function getUser(username) {
    return userCollection.findOne({ username: username });
}

function getUserByToken(token) {
    return userCollection.findOne({ token: token });
}

async function createUser(user) {
    // Hash the password to store in the database
    const passHash = await bcrypt.hash(user.password, SALT_FACTOR);

    // Store the user in the database
    const user = { username: user.username, password: passHash, token: uuid.v4() };
    await userCollection.insertOne(user);

    return user;
}

module.exports = {
    getUser,
    getUserByToken,
    createUser,
};

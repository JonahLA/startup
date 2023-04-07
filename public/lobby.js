
class Room {
    hostName;
    roomCode;
    occupancy;
    roomElement;

    constructor(roomData, roomElement) {
        this.hostname = roomData.hostname;
        this.roomCode = roomData.roomCode;
        this.occupancy = roomData.occupancy;
        this.roomElement = roomElement;

        this.createRoom();
    }

    // Uses room information to create element in DOM
    createRoom() {
        // Set the inner HTML for the root element
        this.roomElement.className = "btn btn-outline-secondary d-flex flex-row";
        this.roomElement.type = "submit";
        this.roomElement.onclick = () => this.chooseRoom(this);

        // Create the child elements according to each of the properties
        const hostNameElement = document.createElement('span');
        hostNameElement.className = "room-user";
        hostNameElement.textContent = this.hostname;

        const roomCodeElement = document.createElement('span');
        roomCodeElement.className = "room-code-option me-auto";
        roomCodeElement.textContent = `/${this.roomCode}`;

        const roomCapacityElement = document.createElement('span');
        roomCapacityElement.className = "room-capacity";
        roomCapacityElement.textContent = `${this.occupancy}/10`;

        // Append those child elements to the root element
        this.roomElement.appendChild(hostNameElement);
        this.roomElement.appendChild(roomCodeElement);
        this.roomElement.appendChild(roomCapacityElement);
    }

    async chooseRoom(room) {
        const isSuccessful = await lobbyHandler.joinRoom(room.roomCode);
        if (isSuccessful) {
            lobbyHandler.saveRoomInfo(room.hostName, room.roomCode);
            window.location.href = "game.html";
        } else {
            console.log('A fatal error occurred trying to join the lobby.');
        }
    }
}

class LobbyHandler {
    rooms;
    roomChoicesElement;

    _getRandomRoomCode() {
        // I took out chars that might be confused with other chars (like 'O' and '0')
        const possibleChars = ['A', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '2', '3', '4', '5', '6', '7', '9'];
        let generatedChars = "";
        for (let i = 0; i < 4; i++) {
            const index = Math.floor(Math.random() * (possibleChars.length - 1));
            generatedChars = generatedChars + possibleChars[index];
        }
        return generatedChars;
    }

    constructor() {
        this.rooms = new Map();
        this.roomChoicesElement = document.querySelector('.room-choices');

        this.loadUsername();
        this.loadRooms();
    }

    async joinRoom(roomCode) {
        const response = await fetch(`/api/lobby/join`, {
            method: 'POST',
            body: JSON.stringify({ roomCode: roomCode, username: this.username }),
            headers: { 'Content-Type': 'application/json; charset=UTF-8', }
        });
        if (response.status === 200) return true;
        else return false;
    }

    async searchRoom() {
        const roomCodeElement = document.querySelector('#room-code-input');
        const roomCode = roomCodeElement.value;
        
        const response = await fetch(`/api/lobby/${roomCode}`);
        if (response.status === 200) {
            const isSuccessful = await this.joinRoom(roomCode);
            if (isSuccessful) {
                this.saveRoomInfo('[hostname]', roomCode);
                window.location.href = "game.html";
            } else {
                console.log('A fatal error occurred trying to join the lobby.');
            }
        } else {
            console.log('That room does not exist.');
        }
    }

    async createRoom() {
        let roomCode;
        let test;
        do {
            roomCode = this._getRandomRoomCode();
            test = await fetch(`/api/lobby/${roomCode}`); // Make sure that that code isn't being used already
        } while (test.status !== 204)

        const response = await fetch(`/api/lobby`, {
            method: 'POST',
            body: JSON.stringify({ roomCode: roomCode, hostname: this.username }),
            headers: { 'Content-Type': 'application/json; charset=UTF-8', }
        });

        if (response.status === 200) {
            const isSuccessful = await this.joinRoom(roomCode);
            if (isSuccessful) {
                this.saveRoomInfo('[hostname]', roomCode);
                window.location.href = 'game.html';
            } else {
                console.log('A fatal error occurred trying to join the lobby.');
            }
        } else {
            console.log('A fatal error occurred.');
        }
    }

    saveRoomInfo(hostname, roomCode) {
        // Save this room's info to local storage for later access
        localStorage.setItem('dvd-game-host-name', hostname);
        localStorage.setItem('dvd-game-room-code', roomCode);
    }

    // Get the username of the currently logged-in user and update the username text element with it
    async loadUsername() {
        this.username = localStorage.getItem('dvd-game-username');
        const usernameElement = document.querySelector('#username-tag');
        usernameElement.textContent = this.username ?? '[Anonymous Player]';
    }

    async loadRooms() {
        // Use endpoint to query database for lobbies
        const response = await fetch('/api/lobby'); 
        let availableRooms = await response.json();
        if (availableRooms) {
            // { name of host, room code }
            if (availableRooms.length > 5) availableRooms.length = 5;

            // Save the loaded rooms to the rooms property
            availableRooms.forEach((availableRoom, i) => {
                const roomData = { hostname: availableRoom.hostname, roomCode: availableRoom.roomCode, occupancy: availableRoom.players.length };

                // Create an empty room element (which will be constructed by the Room class)
                const emptyRoomElement = document.createElement('button');
                emptyRoomElement.id = 'room-' + (i + 1); // e.g., 'room-1' or 'room-2'
                this.roomChoicesElement.appendChild(emptyRoomElement);
                this.rooms.set(emptyRoomElement.id, new Room(roomData, emptyRoomElement));
            });
        } else {
            // There are no lobbies available - - oof
            console.log('There are no available lobbies');
        }
    }

    async delay(milliseconds) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(true);
            }, milliseconds);
        });
    }
}

const lobbyHandler = new LobbyHandler();

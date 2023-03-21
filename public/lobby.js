
function createTestData() {
    const testRoomOne = { hostName: 'Kiegan', roomCode: '1234', numPeopleInLobby: '7' };
    const testRoomTwo = { hostName: 'Tate', roomCode: '5678', numPeopleInLobby: '4' };
    const testRoomThree = { hostName: 'Rocky', roomCode: '9012', numPeopleInLobby: '2' };
    const testRoomFour = { hostName: 'Jones', roomCode: '4747', numPeopleInLobby: '1' }
    const testRooms = [testRoomOne, testRoomTwo, testRoomThree, testRoomFour];

    const testRoomsSerialized = JSON.stringify(testRooms);
    localStorage.setItem('dvd-game-availableRooms', testRoomsSerialized);
}

createTestData();

class Room {
    hostName;
    roomCode;
    numPeopleInLobby;
    roomElement;

    constructor(roomData, roomElement) {
        this.hostName = roomData.hostName;
        this.roomCode = roomData.roomCode;
        this.numPeopleInLobby = roomData.numPeopleInLobby;
        this.roomElement = roomElement;

        this.createRoom();
    }

    // Uses room information to create element in DOM
    createRoom() {
        console.log(`Creating room ${this.roomElement.id}...`);

        // Set the inner HTML for the root element
        this.roomElement.className = "btn btn-outline-secondary d-flex flex-row";
        this.roomElement.type = "submit";
        this.roomElement.onclick = () => this.chooseRoom(this);

        // Create the child elements according to each of the properties
        const hostNameElement = document.createElement('span');
        hostNameElement.className = "room-user";
        hostNameElement.textContent = this.hostName;

        const roomCodeElement = document.createElement('span');
        roomCodeElement.className = "room-code-option me-auto";
        roomCodeElement.textContent = `/${this.roomCode}`;

        const roomCapacityElement = document.createElement('span');
        roomCapacityElement.className = "room-capacity";
        roomCapacityElement.textContent = `${this.numPeopleInLobby}/10`;

        // Append those child elements to the root element
        this.roomElement.appendChild(hostNameElement);
        this.roomElement.appendChild(roomCodeElement);
        this.roomElement.appendChild(roomCapacityElement);
    }

    chooseRoom(room) {
        lobbyHandler.saveRoomInfo(room.hostName, room.roomCode);
        window.location.href = "game.html";
    }
}

class LobbyHandler {
    _TIME_TO_REFRESH_;
    rooms;
    roomChoicesElement;

    constructor() {
        this._TIME_TO_REFRESH_ = 5000; // The page will refresh the available rooms every five seconds
        this.rooms = new Map();
        this.roomChoicesElement = document.querySelector('.room-choices');

        this.loadUsername();
        this.loadRooms();
        // this.refreshCycle(); TODO: when this actually starts to work, we'll uncomment this
    }

    // TODO: searchRoom() - gets info from room search and searches for room, navigating to it if it exists
    searchRoom() {
        // WITHOUT WEB SOCKETS, this will basically just create a new lobby with the room code you put in
        const roomCodeElement = document.querySelector('#room-code-input');
        const roomCode = roomCodeElement.value;
        const hostName = this.getHostName(roomCode);

        // Save the info to local storage and change views to the game
        this.saveRoomInfo(hostName, roomCode);
        window.location.href = "game.html";
    }

    saveRoomInfo(hostName, roomCode) {
        // Save this room's info to local storage for later access
        localStorage.setItem('dvd-game-host-name', hostName);
        localStorage.setItem('dvd-game-room-code', roomCode);
    }

    // Given a room code, this will query the server for the name of the host that is hosting this room (if they exist)
    getHostName(roomCode) {
        // TODO: when we get web sockets and a database, hook this up to that
        return '[Host name]';
    }

    // TODO: refreshRooms() - maybe tie this to a button to refresh the available room search!! (is there a way to do an auto-refresh every five seconds by chaining promises???)
    refreshCycle() {
        // TODO: this (HOW DO I USE PROMISES SO THIS IS ON A TIMER WITHOUT ACTUALLY BLOCKING EVERYTHING?)
        this.delay(this._TIME_TO_REFRESH_)
            .then((isSuccessful) => this.performRefresh(isSuccessful));
    }

    performRefresh(isSuccessful) {
        // If the refresh is successful, do something
        
        // If the refresh is not successful, then do something else

        // TODO: THIS WON'T WORK!! WE NEED A FUNCTION TO CHECK IF THERE ARE OPEN ROOMS AND TO RESOLVE/REJECT BASED ON THAT
    }

    loadUsername() {
        // Get the username from local storage and update the username text element with it
        const username = localStorage.getItem('dvd-game-username');
        const usernameElement = document.querySelector('#username-tag');
        usernameElement.textContent = username ?? '[Anonymous Player]';
    }

    loadRooms() {
        // Get all of the rooms from local storage
        const roomData = localStorage.getItem('dvd-game-availableRooms');
        let availableRooms = [];
        if (roomData) {
            availableRooms = JSON.parse(roomData);
        }
        // { name of host, room code, number of people in lobby }

        // Save the loaded rooms to the rooms property
        if (availableRooms.length) {
            availableRooms.forEach((availableRoom, i) => {
                // Create an empty room element (which will be constructed by the Room class)
                const emptyRoomElement = document.createElement('button');
                emptyRoomElement.id = 'room-' + (i + 1); // e.g., 'room-1' or 'room-2'
                this.roomChoicesElement.appendChild(emptyRoomElement);
                this.rooms.set(emptyRoomElement.id, new Room(availableRoom, emptyRoomElement));
            });
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

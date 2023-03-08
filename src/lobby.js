
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

    saveRoomInfo() {
        // Save this room's info to local storage for later access
        localStorage.setItem('dvd-game-host-name', this.hostName);
        localStorage.setItem('dvd-game-room-code', this.roomCode);
    }

    chooseRoom(room) {
        room.saveRoomInfo();
        window.location.href = "game.html";
    }
}

class LobbyHandler {
    rooms;
    roomChoicesElement;

    constructor() {
        this.rooms = new Map();
        this.roomChoicesElement = document.querySelector('.room-choices');

        this.loadUsername();
        this.loadRooms();
    }

    // searchRoom() - gets info from room search and searches for room, navigating to it if it exists
    // UPDATEROOMS() - maybe tie this to a button to refresh the available room search!! (is there a way to do an auto-refresh every five seconds by chaining promises???)

    loadUsername() {
        // Get the username from local storage and update the username text field with it
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
}

const lobbyHandler = new LobbyHandler();

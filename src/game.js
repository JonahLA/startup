
class GameHandler {
    constructor() {
        this.loadUsername();
        this.loadRoomInfo();
    }

    loadUsername() {
        // Get the username from local storage and update the username text element with it
        const username = localStorage.getItem('dvd-game-username');
        const usernameElement = document.querySelector('#username-tag');
        usernameElement.textContent = username ?? '[Anonymous Player]';
    }

    loadRoomInfo() {
        // Get the room code from local storage and update the room code text element with it
        const roomCode = localStorage.getItem('dvd-game-room-code');
        const roomCodeElement = document.querySelector('#room-code-tag');
        roomCodeElement.textContent = `/${roomCode ?? '####'}`;
    }
}

const gameHandler = new GameHandler();

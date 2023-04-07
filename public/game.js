
function delay(milliseconds) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, milliseconds);
    });
}

class Rectangle {
    // (x, y) point to the center of the rectangle
    x;
    y;
    width;
    height;

    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
}

class Circle {
    // (x, y) point to the center of the circle
    x;
    y;
    radius;

    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }
}

function checkRectToCircleCollision(rectangle, circle) {
    /* FROM STACK OVERFLOW: https://stackoverflow.com/questions/401847/circle-rectangle-collision-detection-intersection
        circleDistance.x = abs(circle.x - rect.x);
        circleDistance.y = abs(circle.y - rect.y);

        if (circleDistance.x > (rect.width/2 + circle.r)) { return false; }
        if (circleDistance.y > (rect.height/2 + circle.r)) { return false; }

        if (circleDistance.x <= (rect.width/2)) { return true; } 
        if (circleDistance.y <= (rect.height/2)) { return true; }

        cornerDistance_sq = (circleDistance.x - rect.width/2)^2 +
                            (circleDistance.y - rect.height/2)^2;

        return (cornerDistance_sq <= (circle.r^2));
    */
    
    let circleDistance = {
        x: Math.abs(circle.x - rectangle.x),
        y: Math.abs(circle.y - rectangle.y)
    }

    if (circleDistance.x > (rectangle.width / 2 + circle.radius)) { return false; }
    if (circleDistance.y > (rectangle.height / 2 + circle.radius)) { return false; }

    if (circleDistance.x <= (rectangle.width / 2)) { return true; }
    if (circleDistance.y <= (rectangle.height / 2)) { return true; }

    let cornerDistance_sq = Math.pow(circleDistance.x - rectangle.width / 2, 2) +
                            Math.pow(circleDistance.y - rectangle.height / 2, 2);

    return (cornerDistance_sq <= Math.pow(circle.radius, 2));
}

// THIS IS A BASE CLASS TO BE INHERITED BY THE GAME TOKENS
class Token {
    state;
    width;
    height;
    context;

    constructor(startX, startY, width, height, context) {
        this.state = {
            centerX: startX,
            centerY: startY
        }

        this.width = width;
        this.height = height;
        this.context = context;
    }

    draw() {
        // Draw object
    }
}

class DVDLogoToken extends Token {
    // The SVG aspect ratio is 20:9
    static _DVD_LOGO_WIDTH_ = 200;
    static _DVD_LOGO_HEIGHT_ = 90;
    static _BASE_SPEED_ = 4;
    image;

    constructor(startX, startY, context) {
        super(startX, startY, DVDLogoToken._DVD_LOGO_WIDTH_, DVDLogoToken._DVD_LOGO_HEIGHT_, context);
        this.state.isActive = false;
        this.randomizeVelocity();

        // Get the image we will use for the logo from the DOM
        this.image = document.getElementById('dvd-logo');
    }

    update(game, players) {
        // Check if the logo hits a wall
        if (this.state.centerX + (this.width / 2) >= this.context.canvas.width ||
             this.state.centerX - (this.width / 2) <= 0) {
            this.state.velocity.x *= -1;
        }
        if (this.state.centerY + (this.height / 2) >= this.context.canvas.height ||
             this.state.centerY - (this.height / 2) <= 0) {
            this.state.velocity.y *= -1;
        }

        // Move the DVD logo
        this.state.centerX += this.state.velocity.x;
        this.state.centerY += this.state.velocity.y;

        // Check for collisions
        players.forEach((player) => {
            if (checkRectToCircleCollision(this.getRectangle(), player.getCircle())) {
                if (!player.state.isEliminated) {
                    game.eliminatePlayer(player);
                }
            } else {
                // Nothing
            }
        });
    }

    // Determine a random direction for the logo to move in at the start of the game
    randomizeVelocity() {
        // Pick a random direction
        let angle = Math.random() * (2 * Math.PI);
        while ((angle > Math.PI / 3 && angle < 2 * Math.PI / 3) ||
                (angle > 4 * Math.PI / 3 && angle < 5 * Math.PI / 3)) {
            angle = Math.random() * (2 * Math.PI);
        }

        // Construct a unit vector in that direction
        let baseVector = { x: Math.cos(angle), y: Math.sin(angle) };

        // Scale the vector by the base speed of the DVDLogo
        let scaledVector = { x: baseVector.x * DVDLogoToken._BASE_SPEED_, y: baseVector.y * DVDLogoToken._BASE_SPEED_ };
        this.state.velocity = scaledVector;
    }

    // This is used for collision detection
    getRectangle() {
        let rectangle = new Rectangle(this.state.centerX, this.state.centerY, this.width, this.height);
        return rectangle;
    }

    // This value will control whether the DVDLogoToken is moving or not (HOW DO I HANDLE THE UPDATE BETWEEN THIS AND THE GAME??)
    setActive(value) {
        this.state.isActive = value;
    }

    draw() {
        this.context.drawImage(this.image, this.state.centerX - (this.width / 2), this.state.centerY - (this.height / 2), this.width, this.height);
    }
}

class PlayerToken extends Token {
    static _RADIUS_ = 30;
    static _TEXT_COLOR_ = 'white';
    letter;
    color;
    textColor;

    constructor(startX, startY, context, letter, color) {
        // Since we are drawing a circle for the player, the width and the height should be the same
        super(startX, startY, PlayerToken._RADIUS_ * 2, PlayerToken._RADIUS_ * 2, context);
        this.state.isEliminated = false;

        this.letter = letter;
        this.color = color;
        this.textColor = PlayerToken._TEXT_COLOR_;
    }

    // This is used for collision detection
    getCircle() {
        let circle = new Circle(this.state.centerX, this.state.centerY, this.width / 2);
        return circle;
    }

    eliminate() {
        this.state.isEliminated = true;
    }

    draw() {
        if (this.state.isEliminated) return;

        // Drawing a circle is a special case of drawing an arc inside of a canvas
        this.context.fillStyle = this.color;
        this.context.beginPath();
        this.context.arc(this.state.centerX, this.state.centerY, this.width / 2, 0, 2 * Math.PI, false);
        this.context.fill();

        // Drawing the player's letter
        this.context.fillStyle = this.textColor;
        this.context.font = "35px Microsoft Sans Serif";
        this.context.textAlign = 'center';
        this.context.textBaseline = 'middle';
        this.context.fillText(this.letter, this.state.centerX, this.state.centerY);
    }
}

class Game {
    static _FRAME_RATE_ = 60.0;
    static _DELAY_BETWEEN_FRAMES_ = 1000.0 / this._FRAME_RATE_;
    canvas;
    context;
    width;
    height;
    state;
    tokens;
    roomCode;
    username;
    instructionTextElement;

    // Generate a random color
    _getRandomColor() {
        return '#'+(0x1000000+Math.random()*0xffffff).toString(16).substr(1,6);
    }

    constructor() {
        this.canvas = document.querySelector('.game-area');
        this.context = this.canvas.getContext("2d");
        this.roomCode = localStorage.getItem('dvd-game-room-code');
        this.username = localStorage.getItem('dvd-game-username');
        this.state = {
            isGameActive: false
        }

        this.resize(this);

        this.tokens = { 
            dvdLogo: new DVDLogoToken(this.width / 2, this.height / 2, this.context), 
            players: [] 
        };

        this.instructionTextElement = document.getElementById('instruction-text');
        this.configureWebSocket();
    }

    getCursorPosition(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        return { x: x, y: y };
    }

    onClick(event) {
        // If the game is not started yet, then create a player on the click and start it
        if (!this.state.isGameActive) {
            const clickPosition = this.getCursorPosition(event);
            // TODO: if the player clicks too close to the edge, adjust it in so that the player is fully visible

            // Get the username and use the first letter in the token
            const letter = this.username.charAt(0).toUpperCase();

            // Get random color for token
            const color = this._getRandomColor();

            this.tokens.players.push(new PlayerToken(clickPosition.x, clickPosition.y, this.context, letter, color));
            this.startGame();
        }
    }

    resize(gameInstance) {
        gameInstance.width = gameInstance.canvas.getBoundingClientRect().width;
        gameInstance.height = gameInstance.canvas.getBoundingClientRect().height; 
        gameInstance.canvas.width = gameInstance.width;
        gameInstance.canvas.height = gameInstance.height;
    }

    // Perform the game logic
    update() {
        this.tokens.dvdLogo.update(this, this.tokens.players);
    }

    // Draw the game elements
    draw() {
        // Clear the canvas at the start of each frame
        this.context.clearRect(0, 0, this.width, this.height);
        
        // Draw the tokens
        this.tokens.dvdLogo.draw();
        this.tokens.players.forEach((player) => player.draw());
    }

    // Run the gameplay loop
    loop() {
        if (this.state.isGameActive) this.update();
        this.draw();

        // Loop
        delay(Game._DELAY_BETWEEN_FRAMES_)
                .then(() => this.loop());
    }

    // Start the game
    startGame() {
        this.instructionTextElement.textContent = 'Good luck!';
        this.state.isGameActive = true;
        this.tokens.dvdLogo.randomizeVelocity();
    }

    // Initialize the game
    initializeGame() {
        this.instructionTextElement.textContent = 'Click anywhere to place your player!';
        this.tokens.dvdLogo.eliminatePlayer = function(player) { this.eliminatePlayer(player); }
        this.loop();
    }

    // Eliminate the player and end the game
    eliminatePlayer(player) {
        player.eliminate();
        this.state.isGameActive = false;
        this.instructionTextElement.textContent = "You lose!";
        this.socket.send(JSON.stringify({ type:'playerDied', roomCode: this.roomCode, from: this.username }));
    }

    configureWebSocket() {
        const protocol = window.location.protocol === 'http:' ? 'ws' : 'wss';
        this.socket = new WebSocket(`${protocol}://${window.location.host}/ws`);
        this.socket.onopen = () => {
            this.socket.send(JSON.stringify({ type:'joinLobby', roomCode: this.roomCode, from: this.username }));
            gameHandler.displayMessage('system', `You`, `have joined the lobby (#${this.roomCode})`);
        };
        this.socket.onclose = () => {
            console.log('The socket was closed.');
            this.socket.send(JSON.stringify({ type:'leaveLobby', roomCode: this.roomCode, from: this.username }));
            gameHandler.displayMessage('system', `You`, `have left the lobby (#${this.roomCode})`);
        };
        this.socket.onmessage = async (event) => {
            const message = JSON.parse(await event.data.text());
            if (message.type === 'joinLobby') {
                gameHandler.displayMessage('player', message.from, `joined the lobby`)
            } else if (message.type === 'leaveLobby') {
                gameHandler.displayMessage('player', message.from, `left the lobby`);
            } else if (message.type === 'playerDied') {
                gameHandler.displayMessage('player', message.from, `was eliminated`);
            }
        };
    }
}

const game = new Game();
// Add the `getCursorPosition` function to the canvas' `mouseDown` event
game.canvas.addEventListener('mousedown', function(e) { game.onClick(e) });

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

    displayMessage(type, from, message) {
        const messagesElement = document.getElementById('game-messages');
        messagesElement.innerHTML = `<div class="game-message"><span class="game-message-${type}">${from}</span> ${message}</div>` + messagesElement.innerHTML;4
    }
}

const gameHandler = new GameHandler();

// RESIZE
window.onresize = game.resize(game);

// ENTRY TO GAMEPLAY LOOPS
game.initializeGame();

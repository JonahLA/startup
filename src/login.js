
function login() {
    // Get the content from the username field and save it to local storage
    const usernameElement = document.querySelector('#username-field');
    const username = usernameElement.value;
    localStorage.setItem('dvd-game-username', username);
    window.location.href = "lobby.html";
}

// TODO: when we hook up a database, we will actually figure this out
function register() {
    // For the time being, this is going to do the same thing as login
    login();
}

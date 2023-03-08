
function loadUsername() {
    // Get the username from local storage and update the username text field with it
    const username = localStorage.getItem('dvd-game-username');
    const usernameElement = document.querySelector('#username-tag');
    usernameElement.textContent = username ?? '[Anonymous Player]';
}

loadUsername();

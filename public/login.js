
// See if there is a user logged-in or not to display the correct controls
(async () => {
    let authenticated = false;
    const username = localStorage.getItem('username');

    // If the username is logged into storage, check to see if they are authenticated or not
    if (username) {
        const user = await getUser(username);
        authenticated = user.authenticated;
    }

    // If they are authenticated, then display the continue controls
    if (authenticated) {
        document.querySelector('#welcome-username').textContent = `Welcome back, ${username}!`;
        setDisplay('#login-controls', 'none');
        setDisplay('#continue-controls', 'block');
    } else {
        // Otherwise, display the authentication controls
        document.querySelector('#username-field').textContent = username;
        setDisplay('#login-controls', 'block');
        setDisplay('#continue-controls', 'login');
    }
})();

async function login() {
    this.loginOrRegister('login');
}

async function register() {
    this.loginOrRegister('register');
}

async function loginOrRegister(endpoint) {
    // Get the content from the username field and save it to local storage
    const username = document.querySelector('#username-field')?.value;
    const password = document.querySelector('#password-field')?.value;
    const user = { username: username, password: password };

    // Construct an HTTP POST login request and send it to the server
    const response = await fetch(`/api/user/${endpoint}`, {
        method: 'POST',
        body: JSON.stringify(user),
        headers: { 'Content-Type': 'application/json; charset=UTF-8', }
    });
    const body = await response.json();

    if (response?.status === 200) {
        localStorage.setItem("username", username);
        toLobby();
    } else {
        // SHOW ERROR MESSAGE
        const modalEl = document.querySelector('#msgModal');
        modalEl.querySelector('.modal-body').textContent = `⚠ Error: ${body.message}`;
        const msgModal = new bootstrap.Modal(modalEl, {});
        msgModal.show();
    }
}

async function getUser(username) {
    const response = await fetch(`/api/user/${username}`);
    if (response.status === 200) {
        return response.json();
    } else {
        return null;
    }
}

function logout() {
    fetch(`/api/user/logout`, {
        method: 'delete',
    }).then(() => {window.location.href = '/'});
}

function toLobby() {
    window.location.href = 'lobby.html';
}

function checkCompletion() {
    requiredFields = document.querySelectorAll("input.required-field");
    submissionButtons = document.querySelectorAll("button.submission-button"); 

    // Determine if the fields are completed or not
    let isComplete = true;
    this.requiredFields.forEach((fieldElement) => {
        if (fieldElement.value === "") {
            isComplete = false;
        }
    });

    // Enable the button if the fields are completed; otherwise, disable them
    this.submissionButtons.forEach((buttonElement) => {
        if (isComplete) {
            buttonElement.removeAttribute('disabled');
        } else {
            buttonElement.setAttribute('disabled', '');    
        }
    });
}

function setDisplay(controlsID, value) {
    document.querySelector(controlsID).style.display = value;
}

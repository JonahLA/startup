
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
    })
    const body = await response.json();

    if (response?.status === 200) {
        localStorage.setItem("username", username);
        window.location.href = 'lobby.html';
    } else {
        // SHOW ERROR MESSAGE
    }
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

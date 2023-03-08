
class AuthenticationHandler {
    requiredFields;
    submissionButtons;

    constructor() {
        this.requiredFields = document.querySelectorAll("input.required-field");
        this.submissionButtons = document.querySelectorAll("button.submission-button"); 
    }

    // TODO: when we hook up a database, actually figure this out
    login() {
        // Get the content from the username field and save it to local storage
        const usernameElement = document.querySelector('#username-field');
        const username = usernameElement.value;
        localStorage.setItem('dvd-game-username', username);
        window.location.href = "lobby.html";
    }

    // TODO: when we hook up a database, actually figure this out
    register() {
        // For the time being, this is going to do the same thing as login
        this.login();
    }

    checkCompletion(inputElement) {
        // FOR DEBUGGING: console.log(`This element changed: ${inputElement.id}`);

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
}

const authenticationHandler = new AuthenticationHandler();

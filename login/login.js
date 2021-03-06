reset()

// Function to reset login results
function reset() {
    document.querySelector("#result").innerHTML = "";
}

// Verifies the credentials provided with the api
async function verifyCredentials() {
    // Tries given commands and catches the errors if any occur

    if (document.querySelector("#username").value.length === 0 || document.querySelector("#passphrase").value.length === 0) {

        openDialog("missing-user-info")//Error: One or more text fields are empty

        // Tries given commands and catches the errors if any occur

    } else {
        // Gets values of input fields
        username = document.querySelector("#username").value.toString();
        passphrase = document.querySelector("#passphrase").value.toString();

        await getAuthToken()

        if (!localStorage['authToken']) {
            openDialog("incorrect-info")//Error: either the username or the email is wrong and does not match
        }

        // Gets user from api
        await getUserUsingToken().then(() => changePage());
    }
}

function changePage() {
    // Changes user page to the specified page
    window.location.href = '/';
}

// Get the input field
input = document.querySelector("#passphrase")

// Execute a function when the user releases a key on the keyboard
input.addEventListener("keydown", function(event) {
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        document.querySelector('#submit').click();
    }
});
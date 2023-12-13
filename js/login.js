// Reset login results
reset()

// Function to reset login results
function reset() {
    document.querySelector("#result").innerHTML = "";
}

// Verifies the credentials provided with the api
async function verifyCredentials() {
    // Check if the username and passphrase fields actually have content
    if (document.querySelector("#username").value.length === 0 || document.querySelector("#passphrase").value.length === 0) {
        openDialog("missing-user-info")//Error: One or more text fields are empty
    } else {
        // Get values of input fields
        username = document.querySelector("#username").value.toString();
        passphrase = document.querySelector("#passphrase").value.toString();

        // Get auth token
        await getAuthToken()

        //Error: either the username or the email is wrong and does not match
        if (!localStorage['authToken']) openDialog("incorrect-info")

        // Get user from api
        await getUserUsingToken().then(() => changePage());
    }
}

// Changes user page to the specified page
// WHY does this function exist this is utterly useless
function changePage() {
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

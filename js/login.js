// Reset login results
reset()

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

// ---------------------------------------------------------------------------------------------------------------------

/**
 * This function resets the login result.
 *
 * @author Little
 */
function reset() {
    document.querySelector("#result").innerHTML = "";
}

/**
 * This function verifies the provided credentials with the API. If any errors occur, it shows the error. If it is
 * successful, it redirects to the main page (chat page).
 *
 * @returns {Promise<void>}
 *
 * @author Little
 *
 * @see The function for showing error messages: {@link openDialog}
 * @see The function for getting the auth token: {@link getAuthToken}
 * @see The function for getting user information: {@link getUserUsingToken}
 */
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
        await getUserUsingToken().then(() => window.location.href = '/');
    }
}

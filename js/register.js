// Reset login results on load
reset()

// Get the input field
input = document.querySelector("#confirm-passphrase")

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
 * This function resets the login result display.
 *
 * @author Little
 */
function reset() {
    document.querySelector("#result").innerHTML = "";
}

/**
 * This function queries the API to create a new user account. It collects the user data directly from the DOM, and
 * displays an error message if anything goes wrong. If the account creation is successful, it logs in the newly created
 * user.
 *
 * @returns {Promise<void>}
 *
 * @author Little
 *
 * @see The function for displaying error messages: {@link openDialog}
 * @see The function for getting the auth token: {@link getAuthToken}
 * @see The function for logging in: {@link checkIfLoggedIn}
 * @see The function for getting user data: {@link getUserUsingToken}
 */
async function createUser() {
    // TODO: Check if this is duplicated code. It seems like it.
    // Check that all fields have values
    // Isn't this missing some fields?
    if (document.querySelector("#username").value.length === 0 || document.querySelector("#passphrase").value.length === 0 || document.querySelector("#confirm-passphrase").value.length === 0) {
        // Log error if dev mode is enabled
        if (dev) console.debug("fill all fields");

        // Error: one or more text fields are empty
        openDialog("missing-user-info")
    }
    // Checks if passphrase and confirm-passphrase fields are the same
    else if ($("#passphrase").val() === $("#confirm-passphrase").val()) {
        // Log success if dev enabled
        if (dev) console.debug("valid");

        // Tries given commands and catches the errors if any occur
        try {
            if (dev) console.debug("axios request");

            // Grabs all values from necessary fields
            username = document.querySelector("#username").value.toString();
            email = document.querySelector("#email").value.toString();
            passphrase = document.querySelector("#passphrase").value.toString();

            // Print values if dev mode enabled
            if (dev) console.debug(username, email, passphrase)

            // Send user creating request to API
            result = (await axios ({
                method: 'post',
                url: api + 'user/create',
                data: {
                    Username: username,
                    Email: email,
                    Pass: passphrase
                }
            })).data;

            // Check if the user creation was successful
            if (result) {
                // Successful
                // Get auth token
                await getAuthToken()

                // Log in the user (i think)
                checkIfLoggedIn().then(() => window.location.href = "/")
            } else {
                openDialog("email-or-username-is-already-taken") // Error: username or email is already in use
            }
        }
        catch(e) {
            // Print any errors
            console.error();
            if (dev) console.debug(onerror);
            if (dev) console.debug(result)
        }
    } else {
        openDialog("bad-new-password") //Error: The password and the confirm password is not the same
    }

    await getUserUsingToken();
}

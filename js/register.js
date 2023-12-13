// Reset login results on load
reset()

// Function to reset login results
function reset() {
    document.querySelector("#result").innerHTML = "";
}

// Verifies the credentials provided with the api
// TODO: Check if this is duplicated code. It seems like it.
async function createUser() {
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

    // Stores token in localstorage
    // localStorage['authToken'] = token; // only strings

    // if (token.length === 0) {
    //
    // }

    await getUserUsingToken();
}

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

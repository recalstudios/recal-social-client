reset()

// Function to reset login results
function reset() {
    document.querySelector("#result").innerHTML = "";
}

// Verifies the credentials provided with the api
async function createUser() {

    if (document.querySelector("#username").value.length === 0 || document.querySelector("#passphrase").value.length === 0 || document.querySelector("#confirm-passphrase").value.length === 0) {
        if (dev) console.debug("fill all fields");

        openDialog("missing-user-info")

    } else if ($("#passphrase").val() === $("#confirm-passphrase").val()) { // Checks if passphrase and confirm-passphrase fields are the same
        if (dev) console.debug("valid");

        // Tries given commands and catches the errors if any occur
        try {

            if (dev) console.debug("axios request");

            // Grabs all values from necessary fields
            username = document.querySelector("#username").value.toString();
            email = document.querySelector("#email").value.toString();
            passphrase = document.querySelector("#passphrase").value.toString();


            if (dev) console.debug(username, email, passphrase)

            // API request with axios. Post request where the url field describes where the request should go and the data field what should be in it.
            result = (await axios ({
                method: 'post',
                url: api + 'user/create',
                data: {
                    Username: username,
                    Email: email,
                    Pass: passphrase
                }
            })).data;
            if (result) {
                await getAuthToken()

                checkIfLoggedIn().then(() => window.location.href = "/")
            } else {
                openDialog("email-or-username-is-already-taken")
            }

        }
        catch(e) {
            console.error();
            if (dev) console.debug(onerror);
            if (dev) console.debug(result)
        }
    } else {
        openDialog("bad-new-password")
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

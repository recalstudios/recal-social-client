reset()

// Function to reset login results
function reset() {
    document.querySelector("#result").innerHTML = "";
}

// Verifies the credentials provided with the api
async function createUser() {

    if (document.querySelector("#username").value.length === 0 || document.querySelector("#passphrase").value.length === 0 || document.querySelector("#confirm-passphrase").value.length === 0) {
        $("#result").text("Please fill all fields")

        console.log("fill all fields");



    } else if ($("#passphrase").val() === $("#confirm-passphrase").val()) { // Checks if passphrase and confirm-passphrase fields are the same
        $("#result").text("Valid")
        console.log("valid");

        // Tries given commands and catches the errors if any occur
        try {

            console.log("axios request");

            // Grabs all values from necessary fields
            username = document.querySelector("#username").value.toString();
            email = document.querySelector("#email").value.toString();
            passphrase = document.querySelector("#passphrase").value.toString();


            console.log(username, email, passphrase)

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
                $("#result").text("User made, you will now be logged in")

                await getAuthToken();
            }
        }
        catch(e) {
            console.error();
            console.log(onerror);
            console.log(result)
        }
    } else {
        $("#result").text("Fields does not match")
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

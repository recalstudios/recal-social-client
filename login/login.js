reset()

// Function to reset login results
function reset() {
    document.querySelector("#result").innerHTML = "";
}

// Verifies the credentials provided with the api
async function verifyCredentials() {
    // Tries given commands and catches the errors if any occur

    if (document.querySelector("#username").value.length === 0 || document.querySelector("#passphrase").value.length === 0) {
        $("#result").text("Please fill all fields")

        console.log("fill all fields");

        // Tries given commands and catches the errors if any occur

    } else {
        // Gets values of input fields
        username = document.querySelector("#username").value.toString();
        passphrase = document.querySelector("#passphrase").value.toString();

        await getAuthToken()

        console.log(authToken)

        // Stores token in localstorage
        localStorage['token'] = authToken; // only strings

        // Gets user from api
        await getUserUsingToken();

        // Changes page
        //await changePage()
    }
}

function changePage() {
    // Changes user page to the specified page
    window.location.href = '/';
}

// If enter go to next text field
$('#form').on('keydown', 'input', function (event) {
    if (event.which === 13) {
        event.preventDefault();
        let $this = $(event.target);
        let index = parseFloat($this.attr('data-index'));
        $('[data-index="' + (index + 1).toString() + '"]').focus();
    }
});

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
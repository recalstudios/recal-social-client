$("#left-arrow").load("assets/left-arrow.svg")

reset()

// Function to reset login results
function reset() {
    document.querySelector("#result").innerHTML = "";
}

// Verifies the credentials provided with the apico
async function createUser() {

    if (document.querySelector("#username").value.length === 0 || document.querySelector("#passphrase").value.length === 0 || document.querySelector("#confirm-passphrase").value.length === 0) {
        $("#result").text("Please fill all fields")

        console.log("fill all fields");

        // Tries given commands and catches the errors if any occur

    } else if ($("#passphrase").val() === $("#confirm-passphrase").val()) {
        $("#result").text("Valid")
        console.log("valid");

        try {

            console.log("axios request");

            // Grabs all values from necessary fields
            username = document.querySelector("#username").value;
            email = document.querySelector("#email").value;
            passphrase = document.querySelector("#passphrase").value;

            // API request with axios. Post request where the url field describes where the request should go and the data field what should be in it.
            result = await axios ({
                method: 'post',
                url: api + 'user/create',
                data: {
                    Username: JSON.stringify(username),
                    Email: JSON.stringify(email),
                    Pass: JSON.stringify(passphrase)
                }.data
            });
            if (result) {
                $("#result").text("User made, you will now be logged in")
            }
        }
        catch(e) {
            console.error();
            console.log(onerror);
            console.log(result)
        }
    } else {
        $("#result").text("Fields does not match")
        console.log("Fields does not match")
    }



    // Stores token in localstorage
    // localStorage['token'] = token; // only strings

    // if (token.length === 0) {
    //
    // }

    await getUser();
}

// Function to get the user from api and loads token (if available from localstorage)
async function getUser() {
    // token = localStorage['token']
    //
    // user = (await axios({
    //     method: 'get',
    //     url: api + '/users',
    //     data: {
    //         token: token
    //     }
    // })).data;
}

$('#form').on('keydown', 'input', function (event) {
    if (event.which === 13) {
        event.preventDefault();
        let $this = $(event.target);
        let index = parseFloat($this.attr('data-index'));
        $('[data-index="' + (index + 1).toString() + '"]').focus();
    }
});

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
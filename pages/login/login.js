
reset()

// Function to reset login results
function reset() {
  document.querySelector("#result").innerHTML = "";
}

// Verifies the credentials provided with the apico
async function verifyCredentials() {
    // Tries given commands and catches the errors if any occur

    if (document.querySelector("#username").value.length === 0 || document.querySelector("#passphrase").value.length === 0 || document.querySelector("#confirm-passphrase").value.length === 0) {
        $("#result").text("Please fill all fields")

        console.log("fill all fields");

        // Tries given commands and catches the errors if any occur

    } else {
        try {

            username = document.querySelector("#username").value;
            passphrase = document.querySelector("#passphrase").value;

            // API request with axios. Post request where the url field describes where the request should go and the data field what should be in it.
            authToken = (await axios({
                method: 'post',
                url: api + 'auth/token/new',
                data: {
                    user: username,
                    pass: passphrase
                }
            })).data;
        }
        catch {
            //console.error();
        }

        console.log(authToken)
    }



    // Stores token in localstorage
    localStorage['token'] = token; // only strings

    if (token.length === 0) {
        verifyTextfield("none", "initial", "none")
    }

    await getUser();

    verifyTextfield("none", "none", "initial")

    // Changes user page to the specified page
    window.location.href = '/';

    // Stores full name in localstorage
    localStorage['fullName'] = `${user.firstName} ${user.lastName}`;
}


// Function to check i've a user is logged in or not
// function checkIfLoggedIn() {
//     // Checks localstorage for token and name and puts them into variables
//     token = localStorage['token'] || '';
//
//     fullName = localStorage['fullName'] || "default profile";
//
//     document.querySelector("#profile-btn").innerHTML = fullName;
//
//     // Checks if if token is empty or not and changes ui depending
//     if (token.length !== 0) {
//         document.querySelector("#profile-logout-cluster").style.display = "initial";
//         document.querySelector("#login-register-cluster").style.display = "none";
//     } else {
//         document.querySelector("#profile-logout-cluster").style.display = "none";
//         document.querySelector("#login-register-cluster").style.display = "initial";
//     }
// }
//
// // Function to check if i have logged in or not when i click on the cart button.
// function checkIfLoggedInCart(state) {
//     token = localStorage['token'] || '';
// }
//
// // Function to log out the user and to make its logged out no matter.
// function logOut() {
//     localStorage['token'] = "";
//
//     localStorage['fullName'] = "";
//
//     cart = [];
//
//     localStorage['cart'] = cart;
//
//     checkIfLoggedIn();
// }

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
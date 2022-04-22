
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
        username = document.querySelector("#username").value.toString();
        passphrase = document.querySelector("#passphrase").value.toString();

        await getAuthToken()

        console.log(authToken)
    }

    // Stores token in localstorage
    localStorage['token'] = authToken; // only strings



    await getUser();

    // Changes user page to the specified page
    // window.location.href = '/';
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
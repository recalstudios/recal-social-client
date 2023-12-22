// Load the user profile
loadProfile().then(() => console.log('Loaded profile'));

input = document.querySelector("#newPfp")
input2 = document.querySelector("#new2Password")

// Execute a function when the user releases a key on the keyboard
input.addEventListener("keydown", function(event) {
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        document.querySelector('.change-user-submit').click();
    }
});

// Execute a function when the user releases a key on the keyboard
input2.addEventListener("keydown", function(event) {
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        document.querySelector('.change-password-submit').click();
    }
});

// ---------------------------------------------------------------------------------------------------------------------

/**
 * This function loads the user profile, stores it globally and displays it in relevant elements.
 *
 * @returns {Promise<void>}
 *
 * @author Little
 *
 * @see The function for getting the user information: {@link getUserUsingToken}
 */
async function loadProfile() {
    // Use the token to get all the user info
    await getUserUsingToken();

    // Store the user info in global variables
    pfp = user.pfp
    theUsername = user.username
    mail = user.email

    // Display the user info where its needed
    document.querySelector("#pfp").src = pfp
    document.querySelector("#pfpUrl").innerHTML = pfp
    document.querySelector("#newPfp").value = pfp

    document.querySelector("#username").innerHTML = theUsername
    document.querySelector("#newUsername").value = theUsername

    document.querySelector("#email").innerHTML = mail
    document.querySelector("#newEmail").value = mail

    //if (dev) console.debug(user.email, user.username, user.pfp, user)
}

// This is garbage why would anyone ever write code like this
// TODO: Realistically we should move completely away from this approach and just apply a simple class that makes things visible and such
/**
 * This function displays the "editing menu" for passphrase and user info by setting display values. It sets any element
 * with specified class1 to the value of one and any element with specified class2 to the value of two.
 *
 * @param {string} class1 - The first class name
 * @param {string} one - The value to set "display" to for class1
 * @param {string} class2 - The second class name
 * @param {string} two - The value to set "display" to for class2
 *
 * @author MRcat77
 */
function edit(class1, one, class2, two) {
    // Change the display value depending on the veritable on all the objects with a specific class depending on the variables
    // veritable? do you mean variable?
    document.querySelectorAll("." + class1).forEach(box => {
        box.style.display = one;
    });
    document.querySelectorAll("." + class2).forEach(box => {
        box.style.display = two;
    });
}

/**
 * This function updates user information with new data provided by the user edit page. It reads data directly from the
 * input fields on the profile page. If anything goes wrong, it shows an error. If the change was successful, it logs
 * out the user (I don't know why).
 *
 * @returns {Promise<void>}
 *
 * @author Little
 *
 * @see The function for checking if the auth token is valid: {@link checkIfAuthTokenExpired}
 * @see The function for hiding the edit fields: {@link edit}
 * @see The function for opening error dialogs: {@link openDialog}
 * @see The function for logging out the user: {@link logOut}
 */
async function changeUser() {
    // Check if auth token is expired
    await checkIfAuthTokenExpired()

    // Globally store new values
    pfp = $("#newPfp").val()
    theUsername = $("#newUsername").val()
    mail = $("#newEmail").val()

    // Check if the text fields are the same as the already used info
    if (pfp === user.pfp && theUsername === user.username && mail === user.email) {
        // Info is the same. Send the user back to the profile info
        edit('inputUser', 'none', 'information', 'flex');
    } else {
        if (pfp.length === 0 || theUsername.length === 0 || mail.length === 0) {
            openDialog("MissingUserInfo"); // Error: if one or more fields are empty
        } else {
            // Send an update user info request to the api
            changeUserResult = (await axios({
                method: 'post',
                url: api + 'user/update',
                headers: {
                    Authorization: 'Bearer ' + authToken
                },
                data: {
                    Username: theUsername,
                    Email: mail,
                    Pfp: pfp
                }
            })).data;

            // Check if the change was successful
            if (changeUserResult === true) {
                // TODO: We really should not log out the user when they edit their info
                // i dont remember why we even did this but i think there was somewhat of a reason
                logOut().then(() => console.log('Logged out user'));
            } else {
                openDialog("AlreadyUsedInfo"); // Error: if username or email is already in use
            }
        }
    }
}

//this uses the text files in the change password menu to change the password in the database
// what files????????
/**
 * This function updates the user passphrase. It collects the data directly from the passphrase edit fields on the
 * profile page. If anything goes wrong, it displays an error dialog.
 *
 * @returns {Promise<void>}
 *
 * @author Little
 *
 * @see The function for checking if the auth token is valid: {@link checkIfAuthTokenExpired}
 * @see The function for displaying error messages: {@link openDialog}
 */
async function changePassword() {
    // Check if auth token has expired
    await checkIfAuthTokenExpired()

    // Globally store passphrase values
    Password1 = $("#new1Password").val();
    Password2 = $("#new2Password").val();
    OldPassword = $("#oldPassword").val();

    // Check if the passphrases match
    if (Password1 === Password2)
    {
        // Send an update passphrase info request to the api
        changePasswordResult = (await axios({
            method: 'post',
            url: api + 'auth/update/pass',
            headers: {
                Authorization: 'Bearer ' + authToken
            },
            data: {
                Pass: OldPassword,
                NewPass: Password1
            }
        })).data;

        // Log the result if dev mode is enabled
        if (dev) console.debug(changePasswordResult)

        // Check if the change was successful
        if (changePasswordResult === true) edit('userinfo', 'flex', 'passwordInfo', 'none'); // Send the user back to the profile info
        else openDialog("BadOldPassword"); //error: the old password is wrong
    }
    else
    {
        // The passphrases do not match
        if (dev) console.debug("fuc")
        openDialog('BadNewPassword'); //error: the new password and the confirm password is not the same
    }
}

// FIXME: This can probably theoretically be run via rce/some other thing directly from the console, so we should rework this for better security
/**
 * This function deletes the user account, clears localStorage and sends the user to the login page.
 *
 * @returns {Promise<void>}
 *
 * @author MRcat77
 */
async function deleteUser() {
    // Request the API to delete the user
    deleteUserResult = (await axios({
        method: 'delete',
        url: api + 'user/delete',
        headers: {
            Authorization: 'Bearer ' + authToken
        }
    })).data;

    // Delete the localstorage, so there is no traces of the deleted account
    localStorage.clear();
    window.location.href = "/login/" // send the user back to the login page
}

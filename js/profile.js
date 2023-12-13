// Loads profile
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

// Load the user profile
loadProfile().then(() => console.log('Loaded profile'));

// this is used to open the editing menu for passphrase and userinfo
// Sets 'class1' display to 'one' and 'class2' display to 'two'
// This is garbage why would anyone ever write code like this
// TODO: Realistically we should move completely away from this approach and just apply a simple class that makes things visible and such
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

// this uses the text files in the change user info menu to change the user info in the database
// what is that supposed to mean
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

//tries to delete the user
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

// FIXME: Everything below here should probably be moved just to stay organised again
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

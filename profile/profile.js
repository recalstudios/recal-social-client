// Loads profile
async function loadProfile() {

    //uses the token to get all the user info
    await getUserUsingToken();

    //console.log(user.pfp)
    //console.log(user.username)
    //console.log(user.email)

    //stores the user info in variables
    pfp = user.pfp
    theUsername = user.username
    mail = user.email

    //displays the user info where its needed
    document.querySelector("#pfp").src = pfp
    document.querySelector("#pfpUrl").innerHTML = pfp
    document.querySelector("#newPfp").value = pfp

    document.querySelector("#username").innerHTML = theUsername
    document.querySelector("#newUsername").value = theUsername

    document.querySelector("#email").innerHTML = mail
    document.querySelector("#newEmail").value = mail

    //if (dev) console.debug(user.email, user.username, user.pfp, user)

}

loadProfile();


function edit(class1, one, class2, two) {

    //they either show or hide the classes depending on the variables
    document.querySelectorAll("." + class1).forEach(box => {
        box.style.display = one;
    });
    document.querySelectorAll("." + class2).forEach(box => {
        box.style.display = two;
    });
}

async function changeUser() {

    await checkIfAuthTokenExpired()

    //stores what is in the text fides
    pfp = $("#newPfp").val()
    theUsername = $("#newUsername").val()
    mail = $("#newEmail").val()

    //checks if the text fields ar the same as the already used info
    if (pfp === user.pfp && theUsername === user.username && mail === user.email) {
        //sends the user back to the profile info
        edit('inputUser', 'none', 'information', 'flex');

    } else {

        if (pfp.length === 0 || theUsername.length === 0 || mail.length === 0) {
            openDialog("MissingUserInfo");// Error: if one or more fields are empty
        } else {
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

            if (changeUserResult === true) {
                //logs out the user so the info will displayed right
                logOut()

            } else {
                openDialog("AlreadyUsedInfo"); // Error: if username or email is already in use

                }
            }
        }
    }


async function changePassword() {

    await checkIfAuthTokenExpired()

    //stores what is in the text fides
    Password1 = $("#new1Password").val();
    Password2 = $("#new2Password").val();
    OldPassword = $("#oldPassword").val();

    //checks if the confirm password filed is right
    if (Password1 === Password2)
    {
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

        if (dev) console.debug(changePasswordResult)

        if (changePasswordResult === true)
        {
            //sends the user back to the profile info
            edit('userinfo', 'flex', 'passwordInfo', 'none');
        } else {
            openDialog("BadOldPassword"); //error: the old password is wrong
        }
    } else {
        if (dev) console.debug("fuc")
        openDialog('BadNewPassword'); //error: the new password and the confirm password is not the same
    }
}

//tries to delete the user
async function deleteUser() {

    deleteUserResult = (await axios({
        method: 'delete',
        url: api + 'user/delete',
        headers: {
            Authorization: 'Bearer ' + authToken
        },
        data: {
            Token: user.Token
        }
    })).data;

    logOut();

}

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
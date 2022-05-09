// Loads profile
async function loadProfile() {

    await getUserUsingToken();

    console.log(user.pfp)
    console.log(user.username)
    console.log(user.email)

    pfp = user.pfp
    theUsername = user.username
    mail = user.email

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

function editUser(one, two) {


    document.querySelectorAll(".inputUser").forEach(box => {
        box.style.display = one;
    });
    document.querySelectorAll(".information").forEach(box => {
        box.style.display = two;
    });
}

function editPassword(one, two) {


    document.querySelectorAll(".userinfo").forEach(box => {
        box.style.display = one;
    });
    document.querySelectorAll(".passwordInfo").forEach(box => {
        box.style.display = two;
    });
}


async function changeUser() {

    await checkIfAuthTokenExpired()

    pfp = $("#newPfp").val()
    theUsername = $("#newUsername").val()
    mail = $("#newEmail").val()

    if (pfp === user.pfp && theUsername === user.username && mail === user.email) {
        editUser('none', 'flex')

    } else {

        if (pfp.length === 0 || theUsername.length === 0 || mail.length === 0) {
            openDialog("MissingUserInfo");//error: if one or more fildes ar empty
        } else {
            //trys to change user info
            changePasswordResult = (await axios({
                method: 'post',
                url: api + 'user/update',
                headers: {
                    Authorization: 'Bearer ' + authToken
                },
                data: {
                    //Pass:
                    Username: theUsername,
                    Email: mail,
                    Pfp: pfp
                }
            })).data;

            if (changePasswordResult === true) {
                logOut()

            } else {
                openDialog("AlreadyUsedInfo"); //eror: if username or email is already in use

                }
            }
        }
    }


async function changePassword() {

    await checkIfAuthTokenExpired()

    Password1 = $("#new1Password").val();
    Password2 = $("#new2Password").val();
    OldPassword = $("#oldPassword").val();

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
            editPassword('flex', 'none');
        } else {
            openDialog("BadOldPassword");
        }
    } else {
        if (dev) console.debug("fuc")
        openDialog('BadNewPassword');
    }
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
// Loads profile
async function loadProfile() {

    await getUserUsingToken();



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

    //console.log(user.email, user.username, user.pfp, user)

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


function changeUser() {



}

async function changePassword() {

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

        console.log(changePasswordResult)

        if (changePasswordResult === true)
        {
            editPassword('flex', 'none');
        } else {
            openDialog("BadOldPassword");
        }
    } else {
        console.log("fuc")
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
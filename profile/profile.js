// Loads profile
async function loadProfile() {

    await getUserUsingToken();

    document.querySelector("#pfp").src = user.pfp
    document.querySelector("#pfpUrl").innerHTML = user.pfp
    document.querySelector("#newPfp").value = user.pfp

    document.querySelector("#username").innerHTML = user.username
    document.querySelector("#newUsername").value = user.username

    document.querySelector("#email").innerHTML = user.email
    document.querySelector("#newEmail").value = user.email

    console.log(user.email, user.username, user.pfp)

    console.log(user)
}

loadProfile();

function changeUser(one, two) {

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


function doneChangingUser() {

}

async function changePassword() {

    if ($("#new1Password").val() === $("#new2Password").val())
    {

        changePasswordResult = (await axios({
            method: 'post',
            url: api + 'auth/update/pass',
            headers: {
                Authorization: 'Bearer ' + authToken
            },
            data: {
                Pass: $("#oldPassword").val(),
                NewPass: $("#new1Password").val()
            }
        })).data;
    }
}
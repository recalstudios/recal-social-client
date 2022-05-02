// Loads profile
async function loadProfile() {

    await getUserUsingToken();

    document.querySelector("#pfp").src = user.pfp

    document.querySelector("#username").innerHTML = user.username
    document.querySelector("#newUsername").value = user.username

    document.querySelector("#email").innerHTML = user.email
    document.querySelector("#newEmail").value = user.email

    console.log(user.email, user.username, user.pfp)

    console.log(user)
}

loadProfile();

function changeUser(one, two) {

    document.querySelectorAll(".input").forEach(box => {
        box.style.display = one;
    });
    document.querySelectorAll(".information").forEach(box => {
        box.style.display = two;
    });
}

function doneChangingUser() {

}
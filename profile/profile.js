function changeSettingsPane(e) {
    $("#profile-box").text('')
}



async function loadProfile() {

    await getUser();

    document.querySelector("#pfp").src = user.pfp

    document.querySelector("#username").innerHTML = user.username

    document.querySelector("#email").innerHTML = user.email

    console.log(user.email, user.username, user.pfp)

    console.log(user)
}

loadProfile();
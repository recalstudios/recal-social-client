    // Load document sections
$("#back").load("/assets/left-arrow.svg");

// Declare variables
let authTokenValidity, authToken, refreshToken, message, sendMessage, input, input2, publicUsername;
let username, email, passphrase, result;
let changePasswordResult;
let theUsername, mail, pfp;
let user;
let chatroomList, chatroomId, currentChatroom, chatroomResult, int;
let Password1, Password2, OldPassword
let dialog = localStorage['dialog'] || false;
let messages = [];
let publicUser =
    {
    "id": 11,
    "username": "woot",
    "pfp": "https://via.placeholder.com/50"
    };

localStorage['publicUser'] = JSON.stringify(publicUser)

// Defines api path
const api = "https://api.social.recalstudios.net/";
//const api = "https://10.80.18.152:7184/";

// Gets auth token with credentials
async function getAuthToken()
{
    // username = document.querySelector("#username").value.toString();
    // passphrase = document.querySelector("#passphrase").value.toString();

    try
    {
        // API request with axios. Post request where the url field describes where the request should go and the data field what should be in it.
        const response = (await axios({
            method: 'post',
            url: api + 'auth/token/new',
            data: {
                username: username,
                password: passphrase
            }
        })).data;

        authToken = response.authToken
        
        refreshToken = response.refreshToken

        console.log(response)

        localStorage['refreshToken'] = refreshToken

        // Stores auth token in localStorage
        localStorage['authToken'] = authToken;
    }
    catch (e)
    {
        console.log(e);
        console.log(result);
        console.log(authToken);
    }
}

// Renews auth token
async function chainRefreshToken()
{
    refreshToken = localStorage['refreshToken']
    console.log(refreshToken)

    //authToken = (await axios.post(api + 'auth/token/renew', { withCredentials: true }).data);

    // Renews auth token from API
    const response = (await axios({
        method: 'post',
        url: api + 'auth/token/renew',
        headers: {
            Authorization: 'Bearer ' + refreshToken
        }
    })).data;

    authToken = response.authToken

    refreshToken = response.refreshToken

    console.log(response)

    localStorage['refreshToken'] = refreshToken

    // Stores auth token in localStorage
    localStorage['authToken'] = authToken;
}

// Gets user from API
async function getUserUsingToken() {

    await checkIfAuthTokenExpired() // Checks if auth token is valid

    // Gets user from API
    user = (await axios({
        method: 'post',
        url: api + 'user/user',
        headers: {
            Authorization: 'Bearer ' + authToken
        }
    })).data;

    console.log(user);

    // Stores user in localStorage
    localStorage['user'] = JSON.stringify(user);
}

async function getUserUsingId(id) {
    // Gets user from API
    publicUsername = (await axios({
        method: 'post',
        url: api + 'user/user/public',
        data: {
            UserId: id
        }
    })).data;

    return publicUsername.username
}

// Checks if the auth token is expired
async function checkIfAuthTokenExpired()
{
    authToken = localStorage['authToken']

    // Request to check if auth token is valid
    authTokenValidity = (await axios({
        method: 'post',
        url: api + 'auth/token/test',
        headers: {
            Authorization: 'Bearer ' + authToken
        }
    })).data;

    // If auth token isn't valid request new one
    if (!authTokenValidity) {
        await chainRefreshToken()
    }

    authToken = localStorage['authToken'] // Gets auth token from localStorage
}

// Function to check i've a user is logged in or not
async function checkIfLoggedIn() {
    // Checks localstorage for token and name and puts them into variables
    authToken = localStorage['authToken'] || '';

    // Checks if if token is empty or not and changes ui depending
    if (authToken.length !== 0) {
        await getUserUsingToken()
    } else {
        window.location.href = "/login/"
    }
}

// Function to log out the user and to make its logged out no matter.
async function logOut() {
    refreshToken = localStorage['refreshToken']

    // Renews auth token from API
    const response = (await axios({
        method: 'post',
        url: api + 'auth/token/logout',
        headers: {
            Authorization: 'Bearer ' + refreshToken
        }
    })).data;

    localStorage['authToken'] = "";
    localStorage['refreshToken'] = "";

    checkIfLoggedIn(); // Checks if logged in
}

// Function to log out the user and to make its logged out no matter.
async function logOutAll() {
    refreshToken = localStorage['refreshToken']

        // Renews auth token from API
        const response = (await axios({
            method: 'post',
            url: api + 'auth/token/logout/all',
            headers: {
                Authorization: 'Bearer ' + refreshToken
            }
        })).data ;

    localStorage['authToken'] = "";
    localStorage['refreshToken'] = "";

    checkIfLoggedIn(); // Checks if logged in
}

function openDialog(dialogName) {
    document.querySelector("#" + dialogName).showModal();
}

function closeDialog(dialogName) {
    document.querySelector("#" + dialogName).close();
}

// If enter go to next text field
$('.form').on('keydown', 'input', function (event) {
    if (event.which === 13) {
        event.preventDefault();
        let $this = $(event.target);
        let index = parseFloat($this.attr('data-index'));
        $('[data-index="' + (index + 1).toString() + '"]').focus();
    }
});

// async function test() {
//     await checkIfAuthTokenExpired() // Checks if auth token is valid
//
//     // If auth token isn't valid request new one
//     if (!authTokenValidity) {
//         await chainRefreshToken()
//     }
//
//     authToken = localStorage['authToken'] // Gets auth token from localStorage
// }
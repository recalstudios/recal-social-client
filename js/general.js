// Load document sections
$("#back").load("/assets/left-arrow.svg");

// Declare variables
let authTokenValidity, authToken, message, sendMessage, input;
let username, email, passphrase, result;
let user;
let chatroomList, chatroomId, currentChatroom, chatroomResult, int;
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
        authToken = (await axios({
            method: 'post',
            url: api + 'auth/token/new',
            data: {
                username: username,
                password: passphrase
            }
        })).data;

        // Stores auth token in localStorage
        localStorage['token'] = authToken;
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
    authToken = localStorage['token']
    console.log(authToken)

    authToken = (await axios.post(api + 'auth/token/renew', { withCredentials: true }).data);

    console.log(authToken)
    //localStorage['token'] = authToken
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

async function getUserUsingId() {
    // Gets user from API
    publicUser = (await axios({
        method: 'post',
        url: api + 'user/user/public',
        data: {
            UserId: user.id
        }
    })).data;

    console.log(publicUser)

    // Stores user in localStorage
    localStorage['publicUser'] = JSON.stringify(publicUser);
}

// Checks if the auth token is expired
async function checkIfAuthTokenExpired()
{
    authToken = localStorage['token']

    // Request to check if auth token is valid
    authTokenValidity = (await axios({
        method: 'post',
        url: api + 'auth/token/test',
        headers: {
            Authorization: 'Bearer ' + authToken
        }
    })).data;

    console.log(authTokenValidity)

    // If auth token isn't valid request new one
    if (!authTokenValidity) {
        await chainRefreshToken()
    }

    authToken = localStorage['token'] // Gets auth token from localStorage
}

// Function to check i've a user is logged in or not
async function checkIfLoggedIn() {
    // Checks localstorage for token and name and puts them into variables
    authToken = localStorage['token'] || '';

    // Checks if if token is empty or not and changes ui depending
    if (authToken.length !== 0) {
        document.querySelector("#profile-logout-cluster").style.display = "initial";
        document.querySelector("#login-register-cluster").style.display = "none";

        await getUserUsingToken()
    } else {
        document.querySelector("#profile-logout-cluster").style.display = "none";
        document.querySelector("#login-register-cluster").style.display = "initial";

        window.location.href = "/login/"
    }
}

// Function to log out the user and to make its logged out no matter.
function logOut() {
    localStorage['token'] = "";

    checkIfLoggedIn(); // Checks if logged in
}

// async function test() {
//     await checkIfAuthTokenExpired() // Checks if auth token is valid
//
//     // If auth token isn't valid request new one
//     if (!authTokenValidity) {
//         await chainRefreshToken()
//     }
//
//     authToken = localStorage['token'] // Gets auth token from localStorage
// }
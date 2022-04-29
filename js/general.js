// Load document sections
$("#back").load("/assets/left-arrow.svg");

// Declare variables
let authTokenValidity, authToken, currentChatroom, messages, message, sendMessage, input;
let username, email, passphrase, result;
let user;

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

        localStorage['token'] = authToken;
    }
    catch (e)
    {
        console.log(e);
        console.log(result);
        console.log(authToken);
    }
}

async function chainRefreshToken()
{
    authToken = localStorage['token']
    console.log(authToken)

    authToken = axios.post(api + 'auth/token/renew', { withCredentials: true }).data;

    console.log(authToken)
    //localStorage['token'] = authToken
}

async function getUser() {

    await checkIfAuthTokenExpired()

    if (!authTokenValidity) {
        await chainRefreshToken()
    }

    authToken = localStorage['token']

    user = (await axios({
        method: 'post',
        url: api + 'user/user',
        headers: {
            Authorization: 'Bearer ' + authToken
        }
    })).data;

    console.log(user)

    localStorage['user'] = user;
}

async function checkIfAuthTokenExpired()
{
    authToken = localStorage['token']

    authTokenValidity = (await axios({
        method: 'post',
        url: api + 'auth/token/test',
        headers: {
            Authorization: 'Bearer ' + authToken
        }
    })).data;

    console.log(authTokenValidity)
}

// Function to check i've a user is logged in or not
function checkIfLoggedIn() {
    // Checks localstorage for token and name and puts them into variables
    authToken = localStorage['token'] || '';

    // Checks if if token is empty or not and changes ui depending
    if (authToken.length !== 0) {
        document.querySelector("#profile-logout-cluster").style.display = "initial";
        document.querySelector("#login-register-cluster").style.display = "none";
    } else {
        document.querySelector("#profile-logout-cluster").style.display = "none";
        document.querySelector("#login-register-cluster").style.display = "initial";
    }
}

// Function to log out the user and to make its logged out no matter.
function logOut() {
    localStorage['token'] = "";


    checkIfLoggedIn();
}
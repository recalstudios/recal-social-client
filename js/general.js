// Global data

// URLs
const apiUrl = "https://api.social.recalstudios.net/"
const wsUrl = "wss://ws.social.recalstudios.net/";

// Variable declarations
let dev = false;
let authToken, refreshToken, message, sendMessage, input, input2, publicUsername;
let username, email, passphrase, result;
let changePasswordResult;
let theUsername, mail, pfp;
let user;
let chatroomList, currentChatroom, chatroomResult, chatroomDetails;
let Password1, Password2, OldPassword
let dialog = localStorage['dialog'] || false;
let messages = [];
let publicUser;

// Global functions for running through browser console

// Function for enabling development mode, this will show more details in the console
function enterDev()
{
    console.info("Entering development mode");
    dev = true;

    // Put other stuff that should also be run on dev mode here
    toggleNetworkDebug(true);
}

// Function for enabling production mode, this will disable development mode and provide a smoother experience
function enterProd()
{
    console.info("Enabling production mode");
    dev = false;

    // Put other stuff that should also be run on prod mode here
    toggleNetworkDebug(false);
}

// ---------------------------------------------------------------------------------------------------------------------

// Load document sections
$("#back").load("/assets/left-arrow.svg");

// Declare variables
localStorage['publicUser'] = JSON.stringify(publicUser)

// Defines api path
const api = apiUrl;
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

        if (dev) console.debug(response)

        localStorage['refreshToken'] = refreshToken

        // Stores auth token in localStorage
        localStorage['authToken'] = authToken;
    }
    catch (e)
    {
        if (dev) console.debug(e);
    }
}

// Renews auth token
async function chainRefreshToken()
{
    refreshToken = localStorage['refreshToken']
    if (dev) console.debug(refreshToken)

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

    if (dev) console.debug(response)

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

    if (dev) console.debug(user);

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

    return publicUsername.username;
}

// Checks if the auth token is expired
async function checkIfAuthTokenExpired()
{
    authToken = localStorage['authToken']

    // Request to check if auth token is valid
    const authTokenValid = (await axios({
        method: 'post',
        url: api + 'auth/token/test',
        headers: {
            Authorization: 'Bearer ' + authToken
        }
    })).data;

    // If auth token isn't valid request new one
    if (!authTokenValid) await chainRefreshToken();

    authToken = localStorage['authToken'] // Gets auth token from localStorage
}

// Function to check if a user is logged in or not
async function checkIfLoggedIn() {
    // Checks localstorage for token and name and puts them into variables
    authToken = localStorage['authToken'] || '';

    // Checks if token is empty or not and changes ui depending on it
    if (authToken.length !== 0) await getUserUsingToken()
    else window.location.href = "/login/";
}

// Function to log out the user and to make its logged out no matter.
async function logOut() {
    refreshToken = localStorage['refreshToken'];

    // Renews auth token from API
    await axios({
        method: 'post',
        url: api + 'auth/token/logout',
        headers: {
            Authorization: 'Bearer ' + refreshToken
        }
    });

    localStorage['authToken'] = "";
    localStorage['refreshToken'] = "";

    checkIfLoggedIn().then(() => localStorage.clear()); // Checks if logged in
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

    checkIfLoggedIn().then(() => localStorage.clear()); // Checks if logged in
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

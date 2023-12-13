// URLs
const apiUrl = "https://api.social.recalstudios.net/"
const wsUrl = "wss://ws.social.recalstudios.net/";

// Variable declarations
// I really should document all of these variables, but I really don't want to
let dev = false; // Whether the application is in "developer mode", if true lets the user see debug information in the console
let authToken, refreshToken, message, sendMessage, input, input2, publicUsername;
let username, email, passphrase, result;
let changePasswordResult;
let changeUserResult;
let theUsername, mail, pfp;
let chatroomName;
let chatroomList, currentChatroom, currentChatroomId, chatroomResult, chatroomDetails;
let Password1, Password2, OldPassword;
let deleteUserResult;
let user;
let dialog = localStorage['dialog'] || false;
let messages = [];

// ---------------------------------------------------------------------------------------------------------------------

// Global functions for running through browser console

// Function for enabling development mode, this will show more details in the console
// noinspection JSUnusedGlobalSymbols
function enterDev()
{
    console.info("Entering development mode");
    dev = true;

    // Put other stuff that should also be run on dev mode here
    toggleNetworkDebug(true);
}

// Function for enabling production mode, this will disable development mode and provide a smoother experience
// noinspection JSUnusedGlobalSymbols
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

// Define the API path
const api = apiUrl + "v1/";

// Get auth token with credentials
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

        // Process the received data from api
        authToken = response.authToken
        refreshToken = response.refreshToken

        // Print to console if dev mode is turned on
        if (dev) console.debug(response)

        // Store data in localStorage
        localStorage['refreshToken'] = refreshToken
        localStorage['authToken'] = authToken;
    }
    catch (e)
    {
        // Print errors to console if dev mode is enabled
        if (dev) console.debug(e);
    }
}

// Renew auth token
async function chainRefreshToken()
{
    // Retrieve refresh token from localstorage
    refreshToken = localStorage['refreshToken']
    if (dev) console.debug(refreshToken) // Log if dev mode is enabled (THIS IS VERY INSECURE WE SHOULD NOT DO THIS)

    //authToken = (await axios.post(api + 'auth/token/renew', { withCredentials: true }).data);

    // Renew auth token from API
    const response = (await axios({
        method: 'post',
        url: api + 'auth/token/renew',
        headers: {
            Authorization: 'Bearer ' + refreshToken
        }
    })).data;

    // Process the received data from api
    authToken = response.authToken
    refreshToken = response.refreshToken

    // Log the response if dev mode is enabled
    if (dev) console.debug(response)

    // Store data in localStorage
    localStorage['refreshToken'] = refreshToken
    localStorage['authToken'] = authToken;
}

// Get user from API with token
async function getUserUsingToken() {
    // Check if auth token is valid
    await checkIfAuthTokenExpired()

    // Get user from API
    user = (await axios({
        method: 'post',
        url: api + 'user/user',
        headers: {
            Authorization: 'Bearer ' + authToken
        }
    })).data;

    user.password = null // uhh, what?

    // Log the user to console if dev mode is enabled
    if (dev) console.debug(user);

    // Store user in localStorage
    localStorage['user'] = JSON.stringify(user);
}

// Get user from API with user id
// This function might never be used?
async function getUserUsingId(id) {
    // Get user from API with id
    publicUsername = (await axios({
        method: 'post',
        url: api + 'user/user/public',
        data: {
            UserId: id
        }
    })).data;

    return publicUsername.username;
}

// Check if the auth token is expired
async function checkIfAuthTokenExpired()
{
    // Get auth token from localstorage
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
    // Check localstorage for token and name and puts them into variables
    authToken = localStorage['authToken'] || '';

    // Check if the token is empty or not and change the ui depending on it
    if (authToken.length !== 0) await getUserUsingToken()
    else window.location.href = "/login/"; // Switches user page
}

// Function to log out the user and to make its logged out no matter.
async function logOut() {
    refreshToken = localStorage['refreshToken']; // Gets refresh token from localStorage

    // Renews auth token from API
    await axios({
        method: 'post',
        url: api + 'auth/token/logout',
        headers: {
            Authorization: 'Bearer ' + refreshToken
        }
    });

    // Clears localstorage of auth token and refresh token
    localStorage['authToken'] = "";
    localStorage['refreshToken'] = "";

    dialog = localStorage['dialog']

    checkIfLoggedIn().then(() => localStorage.clear()); // Checks if logged in
}

// Function to log out the user and to make its logged out no matter.
async function logOutAll() {
    // Get refresh token from localstorage
    refreshToken = localStorage['refreshToken']

    // Renews auth token from API
    const response = (await axios({
        method: 'post',
        url: api + 'auth/token/logout/all',
        headers: {
            Authorization: 'Bearer ' + refreshToken
        }
    })).data ;

    // Clears localstorage of auth token and refresh token
    localStorage['authToken'] = "";
    localStorage['refreshToken'] = "";

    checkIfLoggedIn().then(() => localStorage.clear()); // Checks if logged in
}

// Opens dialog with passed through variable
function openDialog(dialogName) {
    document.querySelector("#" + dialogName).showModal(); // Opens dialog, centers it, and creates shadow behind the dialog box
}

// Closes dialog with passed through variable
function closeDialog(dialogName) {
    document.querySelector("#" + dialogName).close();
}

// Shows a dropdown menu with the specified selector
function show(selector)
{
    document.querySelector(selector).classList.toggle("show");
}

// Close open dropdowns if the user clicks outside it
window.onclick = event =>
{
    // Check if the click target does not match dropdown
    if (!event.target.matches('.dropbtn'))
    {
        // Close all dropdowns
        // This might be better as a foreach?
        const dropdowns = document.getElementsByClassName("dropdown-content");
        for (let i = 0; i < dropdowns.length; i++)
        {
            const openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) openDropdown.classList.remove('show');
        }
    }
}

// Go to the next input field if the user presses the enter key
$('.form').on('keydown', 'input', function (event) {
    // Check if the pressed key is the enter key
    if (event.which === 13) {
        event.preventDefault();
        let $this = $(event.target);
        let index = parseFloat($this.attr('data-index'));
        $('[data-index="' + (index + 1).toString() + '"]').focus();
    }
});

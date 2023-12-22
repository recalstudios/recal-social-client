// URLs
const apiUrl = "https://api.social.recalstudios.net/"
const wsUrl = "wss://ws.social.recalstudios.net/";

/**
 * Whether the application is in *development mode*. If this is set to true, the application logs various debug
 * information to the console.
 *
 * @type {boolean}
 *
 * @author Soni
 *
 * @see Function for enabling development mode: {@link enterDev}
 * @see Function for disabling development mode: {@link enterProd}
 */
let dev = false;

/**
 * Messages for the selected chatroom.
 *
 * @type {*[]}
 *
 * @author Little
 *
 * @see Function for fetching messages: {@link fetchMessages}
 */
let messages = [];

/**
 * A global list containing the chatrooms the user is a member of.
 *
 * @type {*[]}
 *
 * @author Little
 *
 * @see Function for fetching the chatroom list from the API: {@link getUserChatrooms}
 */
let chatroomList;

/**
 * A global variable containing details about the currently selected chatroom.
 *
 * @author Little
 *
 * @see Function for fetching chatroom details from the API: {@link fetchChatroomDetails}
 */
let chatroomDetails;

// Other variable declarations
// I really should document all of these variables, but I really don't want to
let authToken, refreshToken, message, sendMessage, input, input2, publicUsername;
let username, email, passphrase, result;
let changePasswordResult;
let changeUserResult;
let theUsername, mail, pfp;
let chatroomName;
let currentChatroom, currentChatroomId, chatroomResult;
let Password1, Password2, OldPassword;
let deleteUserResult;
let user;
let dialog = localStorage['dialog'] || false;

// ---------------------------------------------------------------------------------------------------------------------

// Load document sections
$("#back").load("/assets/left-arrow.svg");

// Define the API path
/**
 * The prefix to use for all routes when accessing the API. This includes the URL as declared in {@link apiUrl} and the
 * API version.
 *
 * @type {string}
 *
 * @author Soni
 *
 * @see The URL for the API: {@link apiUrl}
 */
const api = apiUrl + "v1/";

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

// ---------------------------------------------------------------------------------------------------------------------

/**
 * Function for getting the auth token. This function uses the globally defined variables {@link username} and
 * {@link passphrase} to get the credentials, and use those credentials to query the API for the auth token. The auth
 * token and refresh token are then stored in localStorage.
 *
 * @returns {Promise<void>}
 *
 * @author Little
 */
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

/**
 * Function for renewing the auth token. This uses the refresh token to get a new auth token and a new refresh token and
 * stores them in localStorage.
 *
 * @returns {Promise<void>}
 *
 * @author Little
 */
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

/**
 * This function gets user information from the API using the token, and stores the information in localStorage as JSON.
 *
 * @returns {Promise<void>}
 *
 * @author Little
 *
 * @see Function for checking if the auth token has expired: {@link checkIfAuthTokenExpired}
 */
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
// I'll skip documenting it for now in case it should just go (which it probably should)
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

/**
 * This function checks if the auth token in localStorage is valid. If it isn't, it requests a new one.
 *
 * @returns {Promise<void>}
 *
 * @author Little
 *
 * @see Function for getting a new token: {@link chainRefreshToken}
 */
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

/**
 * This function checks whether a user is logged in. If a user is logged in, it gets the user information. If not, it
 * redirects to the login page.
 *
 * @returns {Promise<void>}
 *
 * @author Soni
 * @author Little
 *
 * @see Function for getting user information: {@link getUserUsingToken}
 */
async function checkIfLoggedIn() {
    // Check localstorage for token and name and puts them into variables
    authToken = localStorage['authToken'] || '';

    // Check if the token is empty or not and change the ui depending on it
    if (authToken.length !== 0) await getUserUsingToken()
    else window.location.href = "/login/"; // Switches user page
}

/**
 * This function logs out the user and clears localStorage.
 *
 * @returns {Promise<void>}
 *
 * @author Little
 *
 * @see Function to check if the logout was successful: {@link checkIfLoggedIn}
 */
async function logOut() {
    refreshToken = localStorage['refreshToken']; // Gets refresh token from localStorage

    // Requests logout from the API
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

/**
 * This function logs out the user and invalidates all tokens, effectively logging out the user from every authenticated
 * session.
 *
 * @returns {Promise<void>}
 *
 * @author Little
 *
 * @see Function used for checking if the logout was successful: {@link checkIfLoggedIn}
 */
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

/**
 * This function displays the dialog with the provided id.
 *
 * @param {string} dialogName - The id of the dialog to be displayed
 *
 * @author Soni
 *
 * @see Function used for showing the dialog: {@link showModal}
 * @see Function for hiding dialogs: {@link closeDialog}
 */
function openDialog(dialogName) {
    // Open dialog, center it, and create shadow behind the dialog box
    document.querySelector("#" + dialogName).showModal();
}

/**
 * This function closes (hides) the dialog with the provided id.
 *
 * @param {string} dialogName - The id of the dialog to be closed
 *
 * @author Soni
 *
 * @see Function used for closing the dialog: {@link HTMLDialogElement.close|close}
 * @see Function for showing dialogs: {@link openDialog}
 */
function closeDialog(dialogName) {
    document.querySelector("#" + dialogName).close();
}

/**
 * This function shows a dropdown menu with the specified selector by toggling the <code>show</code> class.
 *
 * @param {string} selector - The selector on which to toggle the <code>show</code> class
 *
 * @author Soni
 */
function show(selector)
{
    document.querySelector(selector).classList.toggle("show");
}

// ---------------------------------------------------------------------------------------------------------------------

// Global functions for running through browser console

// noinspection JSUnusedGlobalSymbols
/**
 * This function enables *development mode*, a mode that displays more debug information in the browser console. Whether
 * development mode is enabled is declared in the {@link dev} variable.
 *
 * @returns {boolean} Whether development mode is enabled (should always be true)
 *
 * @author Soni
 *
 * @see The function for entering production mode: {@link enterProd}
 */
function enterDev()
{
    console.info("Entering development mode");
    dev = true;

    // Put other stuff that should also be run on dev mode here
    toggleNetworkDebug(true);

    return dev;
}

// Function for enabling production mode, this will disable development mode and provide a smoother experience
// noinspection JSUnusedGlobalSymbols
/**
 * This function enters *production mode*. This disables development mode.
 *
 * @returns {boolean} Whether development is enabled (should always be false)
 *
 * @author Soni
 *
 * @see The function for entering development mode: {@link enterDev}
 */
function enterProd()
{
    console.info("Enabling production mode");
    dev = false;

    // Put other stuff that should also be run on prod mode here
    toggleNetworkDebug(false);

    return dev;
}

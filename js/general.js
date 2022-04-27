// Load document sections
$("#back").load("/assets/left-arrow.svg");

// Declare variables
let authToken, currentChatroom, messages, message, sendMessage, input;
let username, email, passphrase, result;
let user;

const api = "https://api.social.recalstudios.net/";

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
    axios.post(api + 'auth/token/renew', { withCredentials: true });
}

async function getUser() {
    authToken = localStorage['token']

    user = (await axios({
        method: 'post',
        url: api + 'user/user',
        headers: {
            Authorization: 'Bearer ' + authToken
        }
    })).data;

    console.log(user)
}

async function checkIfAuthTokenExpired()
{

}
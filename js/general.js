let api;
let authToken;
let currentChatroom;
let messages;
let message;
let sendMessage;
let input;

let username;
let email;
let passphrase;
let result;

api = "https://api.social.recalstudios.net/"

function savePreviousPage() {
    if (localStorage['previousPage'] !== window.location) {
        console.log(window.location)
        localStorage['previousPage'] = window.location;
    }
}

function goBack() {
    window.location.href = localStorage['previousPage'];
}

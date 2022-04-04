let api;
let token;
let currentChatroom;
let messages;
let message;
let sendMessage;
let input;

function savePreviousPage() {
    if (localStorage['previousPage'] !== window.location) {
        console.log(window.location)
        localStorage['previousPage'] = window.location;
    }
}

function goBack() {
    window.location.href = localStorage['previousPage'];
}

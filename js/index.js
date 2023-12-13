// Sets the current chatroom from localstorage
currentChatroom = localStorage['currentChatroom'];
currentChatroomId = localStorage['currentChatroomId']

let chatroom;

// Clear fields on load
$("#join-chatroom-code").val('')
$("#join-chatroom-password").val('')

$("#create-chatroom-name").val('')
$("#create-chatroom-password").val('')

openWebsocketConnection()

// Execute all functions that load the page
checkIfLoggedIn().then(() => getUserChatrooms().then(() => loadChatrooms()))

//axios.post('URL', data, {
//    withCredentials: true
//});

// Fetches messages from test json file
// Don't know what "file" is supposed to mean
async function fetchMessages()
{
    // Check if the auth token has expired
    await checkIfAuthTokenExpired()

    // Get the auth token from localstorage
    authToken = localStorage['authToken']

    // Fetch messages from API
    messages = (await axios({
        method: 'post',
        url: api + 'chat/room/backlog',
        data: {
            ChatroomId: parseInt(localStorage['currentChatroomId']),
            Start: 0, // This has to be 0 smh (https://github.com/recalstudios/recal-social-client/issues/25)
            Length: 50
        },
        headers: {
            Authorization: 'Bearer ' + authToken
        }
    })).data.messages.reverse();
}

// Load the chat from the current chat room
async function loadChat()
{
    // Do some fuckery which isn't really needed, but little is dumb as fuck, so we're going to have it here for now
    // We can remove it later when little decides to write good code (probably never)
    const currentRoomUsers = chatroomList.find(r => r.id === parseInt(currentChatroom.replace(/\D/g,''))).users;
    if (dev) console.debug(currentRoomUsers); // Log users in the room if dev mode is enabled

    loadUserList(currentRoomUsers)

    // Get the chat list and clear it
    const chatListElement = document.querySelector("#chat-list");
    chatListElement.innerHTML = '';

    // Load messages in chronological order with all appropriate information
    for (const message of messages)
    {
        // Tries to set messagePfp to an image found in currentRoomUsers and if not sets it to a default value
        let messagePfp
        try {
            messagePfp = currentRoomUsers.find(u => u.id === message.author).pfp
        } catch {
            messagePfp = "https://via.placeholder.com/50x50"
        }

        // Tries to set messageUsername to an image found in currentRoomUsers and if not sets it to a default value
        let messageUsername
        try {
            messageUsername = currentRoomUsers.find(u => u.id === message.author).username
        } catch {
            messageUsername = 'Unavailable user'
        }

        // Checks if the user sent the current loading message and loads the delete button if true
        let deleteMessage
        if (user.id === message.author) deleteMessage = "initial"
        else deleteMessage = "none"

        // Add the message to DOM
        chatListElement.innerHTML += `
            <div class="chat">
                <div class="chat-user">
                    <div>
                        <img src="${messagePfp}" alt="skootskoot">
                        <p class="bold">${messageUsername}</p>
                    </div>
                    <div class="right-box">
                        <a onclick="deleteMessage(${message.id})" class="bold delete-X" style="display: ${deleteMessage}">X</a>
                        <p class="bold"><i>${new Date(message.timestamp).toLocaleString()}</i></p>
                    </div>
                </div>
                <p class="chat-message">${message.content.text}</p>
            </div>
        `;
    }

    document.querySelector(".chat:last-child").scrollIntoView(); // Scrolls to bottom of page
}

// Loads chatroom on page
function loadChatrooms() {
    loadsMessagesInChatroom()

    // Highlight the current chatroom
    changeChatRoom(currentChatroom, currentChatroomId).then(() => console.log("Highlighted current chatroom"))

    // I don't know why it's checking for exactly 'false', but it might actually be needed if it can't be any other falsy value
    if (dialog === false) document.querySelector(".chatroom").firstElementChild.click() // Clicks the first chatroom in chatroom list
}

// Loads the actual messages on the page
function loadsMessagesInChatroom() {
    // Get and clear the chat rooms
    const chatroomBox = document.querySelector("#chatroom-list");
    chatroomBox.innerHTML = ''

    // Loads chatroom in chronological order with all appropriate information
    for (const chatroom of chatroomList)
    {
        chatroomBox.innerHTML += `
            <div id="chatroom-${chatroom.id}" class="list-card chatroom clickable" onclick="changeChatRoom('chatroom-${chatroom.id}', ${chatroom.id})">
                <div class="list-card-info">
                    <img src="${chatroom.image}" alt="Placholder">
                    <p>${chatroom.name}</p>
                </div>
                <a class="bold" onclick="openDialog('leave-chatroom')">x</a> 
            </div>
        `;
    }
}

// Changes chat room and highlight colors
async function changeChatRoom(chatroomName, chatroomId)
{
    // FIXME: These null checks shouldn't be here, but littels code is bad
    // I don't know how to fix it tho because i dont remember how the code works lmao this is why we should comment better
    // oldchatroomname = chatroom || "chatroom-alpha";
    if (chatroom) document.querySelector("#" + chatroom).style.backgroundColor = "#40446e";
    if (chatroomName) document.querySelector("#" + chatroomName).style.backgroundColor = "#123";
    // document.querySelector("#" + chatroom).classList.add =

    // Store data globally
    chatroom = chatroomName
    currentChatroom = chatroomName
    currentChatroomId = chatroomId

    // Stores current chatroom with name and id
    localStorage['currentChatroom'] = currentChatroom
    localStorage['currentChatroomId'] = chatroomId

    // Empty the message input box thing
    $("#sendMessage").val('')

    // Reload messages in chat after api fetch
    fetchMessages().then(() => loadChat())

    // Fetch chatroom detail from API
    await fetchChatroomDetails()

    // Set UI information
    $("#current-chatroom-name").text(chatroomDetails.name)
    $("#current-chatroom-code").text(chatroomDetails.code)
    $("#edit-chatroom-name").val(chatroomDetails.name)
    $("#edit-chatroom-password").val(chatroomDetails.pass)
    $("#edit-chatroom-image").val(chatroomDetails.image)
}

// Gets user chatroom
async function getUserChatrooms()
{
    // Check if auth token is expired
    await checkIfAuthTokenExpired()

    // Gets chatroomList from API
    chatroomList = (await axios({
        method: 'get',
        url: api + 'user/rooms',
        headers: {
            Authorization: 'Bearer ' + authToken
        }
    })).data;

    // Log the chatroom list if dev mode is enabled
    if (dev) console.debug(chatroomList)

    // Store the chatroom list in localstorage
    localStorage['chatroomList'] = JSON.stringify(chatroomList)
}

// If dialog is false, it shows the dialog box
// FIXME: This should probably be placed somewhere else in the code to make it more readable
if (!dialog) document.querySelector("#cookie-dialog").showModal()

// Close the cookie consent, and store if privacy consent has been stored
function closePrivacyConsent(dialogName) {
    dialog = true;
    localStorage['dialog'] = dialog // Stores dialog state
    closeDialog(dialogName)
}

// Create chatroom
async function createChatroom(dialogName) {
    // Close dialog
    closeDialog(dialogName)

    // Store the new chatroom name
    chatroomName = $("#create-chatroom-name").val()

    // Check if auth token is expired
    await checkIfAuthTokenExpired()

    // Check if the chatroom name is valid
    if (chatroomName.length === 0){
        openDialog('no-chatroom-name') //Error: There is no chatroom name in the text filed
    } else {
        // Creates chatroomList with API
        chatroomResult = (await axios({
            method: 'post',
            url: api + 'chat/room/create',
            headers: {
                Authorization: 'Bearer ' + authToken
            },
            data: {
                Name: chatroomName,
                Pass: $("#create-chatroom-password").val()
            }
        })).data;

        // Log the result if dev mode is enabled
        if (dev) console.debug(chatroomResult)
        if (chatroomResult && dev) console.debug('your mom') // ?

        // Get chatrooms and load chatroom from api
        await getUserChatrooms().then(() => loadChatrooms())

        // Click on newest chatroom
        document.querySelector(".chatroom").firstElementChild.click()

        // Reopen the websocket
        ws.close(); // Closes the websocket
        openWebsocketConnection(); // Reopens the websocket
    }
}

// Join chatroom
async function joinChatroom(dialogName) {
    // Close dialog for joining the chatroom
    closeDialog(dialogName)

    // Check if the auth token has expired
    await checkIfAuthTokenExpired()

    // Join chatroomList with API // what?
    chatroomResult = (await axios({
        method: 'post',
        url: api + 'chat/room/join',
        headers: {
            Authorization: 'Bearer ' + authToken
        },
        data: {
            Code: $("#join-chatroom-code").val(),
            Pass: $("#join-chatroom-password").val()
        }
    })).data;

    //await sendSystemMessage(' joined the chatroom', 'join')

    // Get chatrooms and load chatroom from api
    await getUserChatrooms().then(() => loadChatrooms())

    // Clear join chatroom fields
    $("#join-chatroom-code").val('')
    $("#join-chatroom-password").val('')
}

// Leave chatroom
async function leaveChatroom(chatroomid) {
    // Check if auth token is expired
    await checkIfAuthTokenExpired()

    // Leave chatroomList with API
    chatroomResult = (await axios({
        method: 'post',
        url: api + 'chat/room/leave',
        headers: {
            Authorization: 'Bearer ' + authToken
        },
        data: {
            ChatroomId: chatroomid
        }
    })).data;

    // Stores chatroom in localstorage
    localStorage['currentChatroom'] = currentChatroom

    //await sendSystemMessage(' left the chatroom', 'leave')

    // Get chatrooms and load chatroom from api
    await getUserChatrooms().then(() => loadChatrooms())

    // Make sure the click code doesn't throw an error
    // How in the everloving fuck does this work (or rather doesnt work)
    chatroom = undefined;

    // Click the first chatroom in the chatroom list
    document.querySelector(".chatroom").firstElementChild.click()
}

// Fetch chatroom details from api
async function fetchChatroomDetails() {
    // Check if auth token expired
    await checkIfAuthTokenExpired()

    // Fetch chatroom details from API
    chatroomDetails = (await axios({
        method: 'post',
        url: api + 'chat/room/details',
        headers: {
            Authorization: 'Bearer ' + authToken
        },
        data: {
            ChatroomId: parseInt(localStorage['currentChatroomId'])
        }
    })).data;

    // Log details if dev mode is enabled
    if (dev) console.log(chatroomDetails);
}

// Load the user list
function loadUserList(list) {
    // Set the user list box to a variable
    const userlist = document.querySelector("#user-list");

    // Clear the userlist
    userlist.innerHTML = ''

    // Load user list in chronological order with all appropriate information
    for (const user of list)
    {
        userlist.innerHTML += `
                <div class="list-card">
                    <div class="list-card-info">
                        <img src="${user.pfp}" alt="Placholder">
                        <p>${user.username}</p>
                    </div>
                </div>
            `;
    }
}

// Edit chatroom
async function editChatroom() {
    // Check if auth token is expired
    await checkIfAuthTokenExpired()

    // Edit chatroom details with API
    const response = (await axios({
        method: 'post',
        url: api + 'chat/room/update',
        headers: {
            Authorization: 'Bearer ' + authToken
        },
        data: {
            ChatroomId: parseInt(localStorage['currentChatroomId']),
            Name: $("#edit-chatroom-name").val(),
            Pass: $("#edit-chatroom-password").val(),
            Image: $("#edit-chatroom-image").val(),
        }
    })).data;

    // Log the response if dev mode is enabled
    if (dev) console.log(response)

    // Close the edit chatroom dialog
    closeDialog('edit-chatroom-dialog')

    // Get chatrooms and load chatroom from api
    getUserChatrooms().then(() => loadChatrooms())
}

// Delete message
async function deleteMessage(id) {
    // Check if auth token expired
    await checkIfAuthTokenExpired()

    // this can probably go, but I don't dare touch this bodged af code
    console.log(id)

    // Delete message with api
    // response isn't used here, this can probably be refactored
    const response = (await axios({
        method: 'post',
        url: api + 'chat/room/message/delete',
        headers: {
            Authorization: 'Bearer ' + authToken
        },
        data: {
            MessageId: id
        }
    })).data;

    // Structure of delete message which sends to ws
    message = JSON.stringify({
        "type": "delete",
        "room": JSON.parse(localStorage['currentChatroomId']),
        "id": id
    });

    // Log the message if dev mode is enabled
    if (dev) console.debug(message);
    ws.send(message); // Sends delete message to ws
}

// Send a system message (for the full release version, not school release)
function sendSystemMessage(message, action) {
    message = JSON.stringify({
        "type": "system",
        "room": 1,
        "action": action,
        "content": {
            "text": user.username + message
        }
    });

    // Send the message to the websocket
    if (dev) console.debug(message); // Debug if dev is enabled
    ws.send(message);
}

// Add event listener to copy button
// FIXME: Place this somewhere else to improve code readability
document.querySelectorAll("#current-chatroom-code").forEach(e =>
{
    e.addEventListener("click", () =>
    {
        navigator.clipboard.writeText(e.innerHTML).then(() => console.log("Copied to clipboard"));
    });
});

// Stores #sendmessage text box in variable
// FIXME: This too
sendMessage = $("#sendMessage")

// Send message to ws
// This runs when a key is pressed in the send chat message field
sendMessage.keypress(function (e)
{
    // Check that the key is enter and shift is not held (i think)
    if (e.which === 13 && !e.shiftKey)
    {
        e.preventDefault();
        $(this).closest("form").submit(); // On enter send message

        // Check that the message has content
        if (document.querySelector("#sendMessage").value.length >= 1) {
            // Structure of content sent to ws
            message = JSON.stringify({
                "type": "message",
                "room": JSON.parse(localStorage['currentChatroomId']),
                "author": JSON.parse(user.id),
                "content": {
                    "attachments": [
                        {
                            "type":"image",
                            "src":"yorumom" // uhh, what is this
                        }
                    ],
                    "text": sendMessage.val()
                }
            });
            //if (dev) console.debug(message);
            ws.send(message); // Sends content to message
            $("#sendMessage").val('')
        }
        // document.querySelector(".chat:last-child").style.color = red;
    }
});

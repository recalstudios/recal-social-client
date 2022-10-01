// Sets the current chatroom from localstorage
currentChatroom = localStorage['currentChatroom'];

currentChatroomId = localStorage['currentChatroomId']

let chatroom;

// Clears fields on load
$("#join-chatroom-code").val('')
$("#join-chatroom-password").val('')

$("#create-chatroom-name").val('')
$("#create-chatroom-password").val('')

openWebsocketConnection()

// Executes all functions which loads page
checkIfLoggedIn().then(() => getUserChatrooms().then(() => loadChatrooms()))


//axios.post('URL', data, {
//    withCredentials: true
//});

// Fetches messages from test json file
async function fetchMessages()
{
    await checkIfAuthTokenExpired()

    authToken = localStorage['authToken']

    messages = (await axios({
        method: 'post',
        url: api + 'chat/room/backlog',
        data: {
            ChatroomId: parseInt(localStorage['currentChatroomId']),
            Start: 1,
            Length: 50
        },
        headers: {
            Authorization: 'Bearer ' + authToken
        }
    })).data.messages.reverse();
}

// Loads the chat from the current chat room
async function loadChat()
{
    // Do some fuckery which isn't really needed, but little is dumb as fuck, so we're going to have it here for now
    // We can remove it later when little decides to write good code (probably never)
    const currentRoomUsers = chatroomList.find(r => r.id === parseInt(currentChatroom.replace(/\D/g,''))).users;
    if (dev) console.debug(currentRoomUsers);

    loadUserList(currentRoomUsers)

    const chatListElement = document.querySelector("#chat-list");

    chatListElement.innerHTML = ''; // Clears previous chat log
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

        // Checks if the user sendt the current loading message and loads the delete button if true
        let deleteMessage

        if (user.id === message.author) {
            deleteMessage = "initial"
        } else {
            deleteMessage = "none"
        }

        // Loads messages in chronological order with all appropriate information
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

    changeChatRoom(currentChatroom, currentChatroomId) // Highlights the current chatroom

    if (dialog === false) document.querySelector(".chatroom").firstElementChild.click() // Clicks the first chatroom in chatroom list
}

// Loads the actual messages on page.
function loadsMessagesInChatroom() {
    const chatroomBox = document.querySelector("#chatroom-list");

    chatroomBox.innerHTML = '' // Clears chatrooms

    // Loads chatroom in chronological order with all appropriate information
    for (const chatroom of chatroomList)
    {
        chatroomBox.innerHTML += `
            <div id="chatroom-${chatroom.id}" class="list-card chatroom" onclick="changeChatRoom('chatroom-${chatroom.id}', ${chatroom.id})">
                <div class="list-card-info">
                    <img src="${chatroom.image}" alt="Placholder">
                    <p>${chatroom.name}</p>
                </div>
                <a class="bold" onclick="openDialog('leave-chatroom')">x</a> 
            </div>
        `;
    }
}

// Changes chat room and highlight colours
async function changeChatRoom(chatroomName, chatroomId)
{
    // FIXME: These null checks shouldn'tbe here, but littels code is bad
    //oldchatroomname = chatroom || "chatroom-alpha";
    if (chatroom) document.querySelector("#" + chatroom).style.backgroundColor = "#40446e";
    if (chatroomName) document.querySelector("#" + chatroomName).style.backgroundColor = "#123";
    // document.querySelector("#" + chatroom).classList.add =

    //
    chatroom = chatroomName
    currentChatroom = chatroomName
    currentChatroomId = chatroomId

    // Stores current chatroom with name and id
    localStorage['currentChatroom'] = currentChatroom
    localStorage['currentChatroomId'] = chatroomId
    $("#sendMessage").val('')

    // Reloads messages in chat after api fetch
    fetchMessages().then(() => loadChat())

    await fetchChatroomDetails() // Fetches chatroom detail from API

    $("#current-chatroom-name").text(chatroomDetails.name)
    $("#current-chatroom-code").text(chatroomDetails.code)
    $("#edit-chatroom-name").val(chatroomDetails.name)
    $("#edit-chatroom-password").val(chatroomDetails.pass)
    $("#edit-chatroom-image").val(chatroomDetails.image)
}

// Gets user chatroom
async function getUserChatrooms()
{
    await checkIfAuthTokenExpired() // Checks if auth token is expired

    // Gets chatroomList from API
    chatroomList = (await axios({
        method: 'get',
        url: api + 'user/rooms',
        headers: {
            Authorization: 'Bearer ' + authToken
        }
    })).data;

    if (dev) console.debug(chatroomList)
    localStorage['chatroomList'] = JSON.stringify(chatroomList)
}

// If dialog is false, it shows the dialog box
if (!dialog)
{
    document.querySelector("#cookie-dialog").showModal()
}

// Closes the cookie consent, and stores if privacy consent has been stored
function closePrivacyConsent(dialogName) {
    dialog = true;
    localStorage['dialog'] = dialog // Stores dialog state
    closeDialog(dialogName)
}

// Creates chatroom
async function createChatroom(dialogName) {
    closeDialog(dialogName) // Closes dialog

    chatroomName = $("#create-chatroom-name").val()

    await checkIfAuthTokenExpired() // Checks if auth token is expired

    //his checks if there is a name for the chat room or not
    if (chatroomName.length === 0){
        openDialog('no-chatroom-name') //Error: There is no chatroom name in the text filed

    } else{
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

        if (dev) console.debug(chatroomResult)

        if (chatroomResult)
        {
            if (dev) console.debug('your mom')
        }

        await getUserChatrooms().then(() => loadChatrooms()) // Gets chatrooms and then loads chatroom from api

        document.querySelector(".chatroom").firstElementChild.click() // Clicks on newest chatroom

        // Reopen the websocket or sumshit
        ws.close(); // Closes the websocket
        openWebsocketConnection(); // Reopens the websocket
    }
}

// Joins chatroom
async function joinChatroom(dialogName) {
    closeDialog(dialogName) // Closes dialog for joining the chatroom

    await checkIfAuthTokenExpired()

    // Joins chatroomList with API
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

    await getUserChatrooms().then(() => loadChatrooms()) // Gets chatrooms and then loads chatroom from api

    // Clears join chatroom fields
    $("#join-chatroom-code").val('')
    $("#join-chatroom-password").val('')
}

// Leaves chatroom
async function leaveChatroom(chatroomid) {

    await checkIfAuthTokenExpired() // Checks if auth token is expired

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

    localStorage['currentChatroom'] = currentChatroom // Stores chatroom in localstorage

    //await sendSystemMessage(' left the chatroom', 'leave')

    await getUserChatrooms().then(() => loadChatrooms()) // Gets chatrooms and then loads chatroom from api

    // Make sure the click code doesnt throw an error
    chatroom = undefined;

    document.querySelector(".chatroom").firstElementChild.click() // Clicks the first chatroom in the chatroom list
}

// Fetches chatroom details from api
async function fetchChatroomDetails() {
    await checkIfAuthTokenExpired() // Checks if auth token expired

    // Fetches chatroom details from API
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

    if (dev) console.log(chatroomDetails);
}

// Loads the user list
function loadUserList(list) {
    const userlist = document.querySelector("#user-list"); // Sets the user list box to a variable

    userlist.innerHTML = '' // Clears the userlist

    // Loads user list in chronological order with all appropriate information
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

// Edits chatroom
async function editChatroom() {
    await checkIfAuthTokenExpired() // Checks if auth token is expired

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

    if (dev) console.log(response)

    closeDialog('edit-chatroom-dialog') // Closes the edit chatroom dialog

    getUserChatrooms().then(() => loadChatrooms()) // Gets chatrooms and then loads chatroom from api
}

// Delete message
async function deleteMessage(id) {
    await checkIfAuthTokenExpired() // Checks if auth token expired

    console.log(id)

    // Deletes message with api
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
    if (dev) console.debug(message);
    ws.send(message); // Sends delete message to ws
}

// Sends system message (for release version, not school release)
function sendSystemMessage(message, action) {
    message = JSON.stringify({
        "type": "system",
        "room": 1,
        "action": action,
        "content": {
            "text": user.username + message
        }
    });
    if (dev) console.debug(message);
    ws.send(message);
}

// Add event listener to copy button
document.querySelectorAll("#current-chatroom-code").forEach(e =>
{
    e.addEventListener("click", () =>
    {
        navigator.clipboard.writeText(e.innerHTML).then(() => console.log("Copied to clipboard"));
    });
});

sendMessage = $("#sendMessage") // Stores #sendmessage textbox in variable

// Sends message to ws
sendMessage.keypress(function (e)
{
    if (e.which === 13 && !e.shiftKey)
    {
        e.preventDefault();
        $(this).closest("form").submit(); // On enter send message
        if (document.querySelector("#sendMessage").value.length >= 1) {
            // Structure of content sendt so ws
            message = JSON.stringify({
                "type": "message",
                "room": JSON.parse(localStorage['currentChatroomId']),
                "author": JSON.parse(user.id),
                "content": {
                    "attachments": [
                        {
                            "type":"image",
                            "src":"yorumom"
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

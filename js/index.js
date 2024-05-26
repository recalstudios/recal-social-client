// Sets the current chatroom from localstorage
currentChatroom = localStorage['currentChatroom'];
currentChatroomId = localStorage['currentChatroomId']

// Declare fields
const joinChatroomCodeField = $("#join-chatroom-code");
const joinChatroomPasswordField = $("#join-chatroom-password");
const createChatroomNameField = $("#create-chatroom-name");
const createChatroomPasswordField = $("#create-chatroom-password");
const sendMessage = $("#sendMessage"); // Message text field

/**
 * Whether the client is waiting in a cooldown before being able to relay typing status again. The default behaviour of
 * this variable is to set it to true when the typing status is being relayed. It will then have a cooldown of a certain
 * time before being set to false again.
 *
 * @type {boolean}
 *
 * @author Soni
 */
let relayTypingStatusCooldown = false;

// Clear fields on load
joinChatroomCodeField.val('')
joinChatroomPasswordField.val('')
createChatroomNameField.val('')
createChatroomPasswordField.val('')

// Connect to the WebSocket
openWebsocketConnection()

// Execute all functions that load the page
checkIfLoggedIn().then(() => getUserChatrooms().then(() => selectTopmostChatroom()))

// If dialog is false, show cookie dialog
if (!dialog) document.querySelector("#cookie-dialog").showModal()

// Add event listener to copy button
document.querySelectorAll("#current-chatroom-code").forEach(e =>
{
    e.addEventListener("click", () =>
    {
        navigator.clipboard.writeText(e.innerHTML).then(() => console.log("Copied to clipboard"));
    });
});

// Register key listener
document.onkeydown = e =>
{
    // Check which key is being pressed
    switch (e.key)
    {
        case "Shift": case "Control": case "Alt": case "Escape": case "Tab": case "Meta": case "PageUp": case "PageDown":
            // Ignore keypress if it is a non-standard key
            break;
        case "Enter":
            // Send message on enter
            if (!e.shiftKey) // Make sure shift is not held
            {
                // Check that the message has content
                if (document.querySelector("#sendMessage").value.length >= 1)
                {
                    // Construct object to send to Websocket
                    let messageContent = JSON.stringify({
                        "type": "message",
                        "room": JSON.parse(localStorage['currentChatroomId']),
                        "author": JSON.parse(user.id),
                        "content": {
                            "attachments": [
                                {
                                    "type": "image",
                                    "src": "null"
                                }
                            ],
                            "text": sendMessage.val()
                        }
                    });

                    // Send the message content to the websocket
                    ws.send(messageContent);

                    // Clear the message field
                    sendMessage.val('');
                }
            }
            break;
        default:
            // If any "normal" key is pressed, focus the message field
            sendMessage.focus();

            // Then, tell the websocket that you are typing, UNLESS you are temporarily rate limited
            if (!relayTypingStatusCooldown)
            {
                // Construct the payload
                const typingPayload = JSON.stringify({
                    type: 'typing',
                    userId: JSON.parse(user.id),
                    room: JSON.parse(localStorage['currentChatroomId'])
                });

                // Send the payload to the websocket
                ws.send(typingPayload);

                // Set cooldown to true and wait for 4 seconds before setting it to false
                relayTypingStatusCooldown = true;
                setTimeout(() => { relayTypingStatusCooldown = false; }, 4000);
            }
    }
}

// ---------------------------------------------------------------------------------------------------------------------

/**
 * This function fetches messages for the currently selected chatroom, and stores them in the global variable
 * {@link messages}.
 *
 * @returns {Promise<void>}
 *
 * @author Little
 *
 * @see Function for checking if the auth token has expired: {@link checkIfAuthTokenExpired}
 * @see Globally stored messages: {@link messages}
 */
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

/**
 * This function fully loads the chatroom into the DOM. This includes loading messages and users.
 *
 * @returns {Promise<void>}
 *
 * @author Little
 *
 * @see Function to load user list: {@link loadUserList}
 */
async function loadChat()
{
    // Get the users in the current chatroom. This seems to be a bad way of doing it, but this is how little wrote the code so it'll stay for now
    // We can remove it later when little decides to write good code (probably never)
    const currentRoomUsers = chatroomList.find(r => r.id === parseInt(currentChatroom.replace(/\D/g,''))).users;

    // Log users in the room if dev mode is enabled
    if (dev) console.debug(currentRoomUsers);

    // Load the users into the DOM
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
            messagePfp = "/assets/default-icon.png";
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
                        <span class="material-symbols-outlined clickable" onclick="deleteMessage(${message.id})" style="display: ${deleteMessage}">delete</span>
                        <p class="bold"><i>${new Date(message.timestamp).toLocaleString()}</i></p>
                    </div>
                </div>
                <p class="chat-message">${message.content.text}</p>
            </div>
        `;
    }

    // Hide the loading animation
    document.querySelector('#chat-window .loading-animation').classList.add('hidden');

    // Check if the chat room has any messages
    if (chatListElement.innerHTML.length > 0)
    {
        // Scroll to the latest chat message
        document.querySelector(".chat:last-child").scrollIntoView();
    }

}

/**
 * This function is responsible for loading the chatroom list and selecting the topmost chatroom.
 *
 * @author Little
 *
 * @see Function for actually loading the chatroom list: {@link loadChatroomList}
 * @see Function for changing the chatroom: {@link changeChatRoom}
 */
function selectTopmostChatroom() {
    loadChatroomList();

    // Highlight the current chatroom
    changeChatRoom(currentChatroom, currentChatroomId).then(() => console.log("Highlighted current chatroom"))

    // I don't know why it's checking for exactly 'false', but it might actually be needed if it can't be any other falsy value
    if (dialog === false) document.querySelector(".chatroom").firstElementChild.click() // Clicks the first chatroom in chatroom list
}

/**
 * This function loads the chatroom list from the global variable {@link chatroomList}.
 *
 * @author Little
 *
 * @see The global list of chatrooms: {@link chatroomList}
 */
function loadChatroomList() {
    // Get and clear the chat rooms
    const chatroomBox = document.querySelector("#chatroom-list");
    chatroomBox.innerHTML = ''

    // Loads chatroom in chronological order with all appropriate information
    for (const chatroom of chatroomList)
    {
        chatroomBox.innerHTML += `
            <div id="chatroom-${chatroom.id}" class="list-card chatroom clickable" onclick="changeChatRoom('chatroom-${chatroom.id}', ${chatroom.id})">
                <!-- 'onerror' attribute loads a new image if the original src doesn't exist (instead of showing alt text). WebStorm says 'onerror' is obsolete, but it still works I guess -->
                <img src="${chatroom.image}" alt="Chatroom image" onerror="this.src='/assets/default-icon.png';">
                <p>${chatroom.name}</p>
                <span class="material-symbols-outlined leave-chatroom-button" onclick="openDialog('leave-chatroom')">close</span>
            </div>
        `;
    }
}

/**
 * This function sets the selected chatroom to the one specified, and fetches the details and messages of the newly
 * selected chatroom.
 *
 * @param {string} chatroomName - The name of the chatroom to change to
 * @param {number} chatroomId - The ID of the chatroom to change to
 * @returns {Promise<void>}
 *
 * @author Little
 *
 * @see The function for fetching the chatroom messages: {@link fetchMessages}
 * @see The function for loading the DOM: {@link loadChat}
 * @see The function for fetching the chatroom details: {@link fetchChatroomDetails}
 */
async function changeChatRoom(chatroomName, chatroomId)
{
    // Remove class from last selected room
    // This is a loop (forEach) to prevent errors - this way, the code never tries to run if there are no elements matching the selector
    document.querySelectorAll(".selected-chatroom").forEach(e => e.classList.remove("selected-chatroom"));

    // Add class to currently selected room
    document.querySelector("#" + chatroomName).classList.add("selected-chatroom");

    // Store data globally
    currentChatroom = chatroomName
    currentChatroomId = chatroomId

    // Stores current chatroom with name and id
    localStorage['currentChatroom'] = currentChatroom
    localStorage['currentChatroomId'] = chatroomId

    // Reload messages in chat after api fetch
    fetchMessages().then(() => loadChat())

    // Fetch chatroom detail from API
    await fetchChatroomDetails();

    // Set UI information
    $("#current-chatroom-name").text(chatroomDetails.name)
    $("#current-chatroom-code").text(chatroomDetails.code)
    $("#edit-chatroom-name").val(chatroomDetails.name)
    $("#edit-chatroom-password").val(chatroomDetails.pass)
    $("#edit-chatroom-image").val(chatroomDetails.image)

    // Reset the message input field
    sendMessage.attr('placeholder', `Message ${chatroomDetails.name}`);
    sendMessage.val('');
}

/**
 * This function fetches the chatroom list from the API, and stores it in localStorage as JSON.
 *
 * @returns {Promise<void>}
 *
 * @author Little
 *
 * @see The function for making sure the auth token is valid: {@link checkIfAuthTokenExpired}
 */
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

/**
 * This function closes the privacy consent dialog, and stores to localStorage that the dialog has been seen and closed.
 *
 * @param {string} dialogName - The id of the privacy consent dialog
 *
 * @author Little
 *
 * @see The function used for closing the dialog: {@link closeDialog}
 */
function closePrivacyConsent(dialogName) {
    dialog = true;
    localStorage['dialog'] = dialog // Stores dialog state
    closeDialog(dialogName)
}

/**
 * This function requests the API to create a chatroom. The name and password of the chatroom is collected from the DOM
 * using jQuery. If there are any problems, it displays the error. If the creation is successful, it fetches the new
 * chatroom list, loads the new chatroom, selects it and reconnects to the websocket.
 *
 * @param {string} dialogName - The ID of the dialog to close (this should be the create chatroom dialog)
 * @returns {Promise<void>}
 *
 * @author MRcat77
 * @author Little
 *
 * @see The function to close the dialog: {@link closeDialog}
 * @see The function to check if the auth token is valid: {@link checkIfAuthTokenExpired}
 * @see The function to open error dialogs: {@link openDialog}
 * @see The function to fetch the new chatroom list: {@link getUserChatrooms}
 * @see The function to load the new chatroom list: {@link selectTopmostChatroom}
 * @see The function to reconnect to the websocket: {@link openWebsocketConnection}
 */
async function createChatroom(dialogName) {
    // Close dialog
    closeDialog(dialogName)

    // Store the new chatroom name
    chatroomName = createChatroomNameField.val()

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
                Pass: createChatroomPasswordField.val()
            }
        })).data;

        // Log the result if dev mode is enabled
        if (dev) console.debug(chatroomResult)
        if (chatroomResult && dev) console.debug('your mom') // ?

        // Get chatrooms and load chatroom from api
        await getUserChatrooms().then(() => selectTopmostChatroom())

        // Click on newest chatroom
        document.querySelector(".chatroom").firstElementChild.click()

        // Reopen the websocket
        ws.close(); // Closes the websocket
        openWebsocketConnection(); // Reopens the websocket
    }
}

/**
 * This function requests the API to join a new chatroom. The join code and password are collected from the DOM using
 * jQuery. Then, refresh the chatroom list.
 *
 * @param {string} dialogName - The ID of the dialog to close (This should be the join dialog)
 * @returns {Promise<void>}
 *
 * @author Little
 *
 * @see The function for closing the dialog: {@link closeDialog}
 * @see The function for checking if the auth token is valid: {@link checkIfAuthTokenExpired}
 * @see The function for getting the new chatroom list: {@link getUserChatrooms}
 * @see The function for loading the new chatroom list into the DOM: {@link selectTopmostChatroom}
 */
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
            Code: joinChatroomCodeField.val(),
            Pass: joinChatroomPasswordField.val()
        }
    })).data;

    // Get chatrooms and load chatroom from api
    await getUserChatrooms().then(() => selectTopmostChatroom())

    // Clear join chatroom fields
    joinChatroomCodeField.val('')
    joinChatroomPasswordField.val('')
}

/**
 * This function queries the API to leave a chatroom. It then reloads the chatroom list, and selects the topmost
 * chatroom.
 *
 * @param {number} chatroomid - The ID of the chatroom to leave
 * @returns {Promise<void>}
 *
 * @author Little
 *
 * @see The function to check if the auth token is valid: {@link checkIfAuthTokenExpired}
 * @see The function to fetch the chatroom list from the API: {@link getUserChatrooms}
 * @see The function to load the chatroom list into the DOM: {@link selectTopmostChatroom}
 */
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
    // Maybe this is wrong? The variables seem unrelated
    localStorage['currentChatroom'] = currentChatroom

    // Get chatrooms and load chatroom from api
    await getUserChatrooms().then(() => selectTopmostChatroom())

    // Click the first chatroom in the chatroom list
    document.querySelector(".chatroom").firstElementChild.click()
}

/**
 * This function gets the details of the currently selected chatroom from the API and stores it in the global variable
 * {@link chatroomDetails}.
 *
 * @returns {Promise<void>}
 *
 * @author Little
 *
 * @see The function for checking if the auth token is valid: {@link checkIfAuthTokenExpired}
 * @see The global variable containing the chatroom details: {@link chatroomDetails}
 */
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

/**
 * This function loads the specified list into the DOM as the user list.
 *
 * @param list - The user list to load
 *
 * @author Little
 */
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
                <img src="${user.pfp}" alt="${user.username}">
                <p>${user.username}</p>
            </div>
        `;
    }
}

/**
 * This function collects values from the edit chatroom dialog and queries the API to edit the current chatroom with the
 * collected information. It then reloads the chatroom list.
 *
 * @returns {Promise<void>}
 *
 * @author Little
 *
 * @see The function to check if the auth token is valid: {@link checkIfAuthTokenExpired}
 * @see The function for closing the dialog: {@link closeDialog}
 * @see The function to fetch the new chatroom list from the API: {@link getUserChatrooms}
 * @see The function to load the chatroom list into the DOM: {@link selectTopmostChatroom}
 */
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
    getUserChatrooms().then(() => selectTopmostChatroom())
}

/**
 * This function deletes a message from the chat.
 *
 * @param {number} id - The ID of the message to delete
 * @returns {Promise<void>}
 *
 * @author Little
 *
 * @see The function to check if the auth token is valid: {@link checkIfAuthTokenExpired}
 */
async function deleteMessage(id) {
    // Check if auth token expired
    await checkIfAuthTokenExpired()

    // this can probably go, but I don't dare touch this bodged af code
    console.log(id)

    // Delete message with api
    // response isn't used here, this can probably be refactored
    await axios({
        method: 'post',
        url: api + 'chat/room/message/delete',
        headers: {
            Authorization: 'Bearer ' + authToken
        },
        data: {
            MessageId: id
        }
    });

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

async function testAddRandomTypingUser()
{
    // Get the users in the current chatroom
    const currentRoomUsers = chatroomList.find(r => r.id === parseInt(currentChatroom.replace(/\D/g,''))).users;

    // Get a user that isn't already in the list
    let randomUser;
    do {
        randomUser = currentRoomUsers[Math.floor(Math.random()*currentRoomUsers.length)];
    }
    while (currentlyTypingUsers.filter(u => u === randomUser).length > 0);

    currentlyTypingUsers.push(randomUser);
    console.log(currentlyTypingUsers);

    // Load the thing
    document.querySelector('#currently-typing-users').innerHTML += `
        <img id="typing-indicator-user-${randomUser.id}" src="${randomUser.pfp}" alt="${randomUser.username}" class="animating">
    `;

    // Remove the fuckass after the shit
    const indicator = document.querySelector(`#typing-indicator-user-${randomUser.id}`);
    indicator.addEventListener('animationend', () => indicator.classList.remove('animating'));
}

function testRemoveLastTypingUser()
{
    currentlyTypingUsers.pop();
    displayTypingUsers();
}

function addTypingUser(userId)
{
    // Fetch user data for the relevant user from already existing data
    const roomUsers = chatroomList.find(r => r.id === parseInt(currentChatroomId)).users;
    const typingUser = roomUsers.find(u => u.id === userId);

    // Add the user to the global list of currently typing users
    currentlyTypingUsers.push(typingUser);

    // Add the user avatar to the DOM
    document.querySelector('#currently-typing-users').innerHTML += `
        <img id="typing-indicator-user-${typingUser.id}" src="${typingUser.pfp}" alt="${typingUser.username}" class="animating">
    `;

    // Remove the animation class when the animation finishes
    const indicator = document.querySelector(`#typing-indicator-user-${typingUser.id}`);
    indicator.addEventListener('animationend', () => indicator.classList.remove('animating'));

    // Remove the user from the list after 5 seconds
    setTimeout(() => removeTypingUser(typingUser), 5000);
}

function removeTypingUser(typingUser)
{
    // Get the index of the user to remove
    const typingUserIndex = currentlyTypingUsers.indexOf(typingUser);

    // Remove the user from the list
    currentlyTypingUsers.splice(typingUserIndex, 1);

    // Recalculate the DOM
    displayTypingUsers();
}

function displayTypingUsers()
{
    document.querySelector('#currently-typing-users').innerHTML = '';

    currentlyTypingUsers.forEach(u => document.querySelector('#currently-typing-users').innerHTML += `
        <img id="typing-indicator-user-${u.id}" src="${u.pfp}" alt="${u.username}">
    `);

    setTimeout(() => document.querySelector(".chat:last-child").scrollIntoView(), 200);
}

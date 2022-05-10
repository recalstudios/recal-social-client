// Sets the current chatroom from localstorage
currentChatroom = localStorage['currentChatroom'];

currentChatroomId = localStorage['currentChatroomId']

let chatroom;

$("#join-chatroom-code").val('')
$("#join-chatroom-password").val('')

$("#create-chatroom-name").val('')
$("#create-chatroom-password").val('')

openWebsocketConnection()

checkIfLoggedIn().then(() => getUserChatrooms().then(() => loadChatrooms()))


//axios.post('URL', data, {
//    withCredentials: true
//});

// let element = document.getElementById('focus');
// element.scrollTop = element.offsetHeight

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

    //Dynamically loads content
    // fetch("/js/json/chatroom-alpha.json")
    //     .then(response => response.json())
    //     .then(data =>
    //     {
    //         messages = data
    //         loadChat()
    //     });
}

// // Dynamically loads content
// fetch("/js/json/testchatrooms.json")
//     .then(response => response.json())
//     .then(data =>
//     {
//         for (let i = 0; i < data.chatrooms.length; i++)
//         {
//             document.querySelector("#chatroom-list").innerHTML += `
//                 <div id="${data.chatrooms[i].chatroom}" class="chatroom" onclick="changeChatRoom('${data.chatrooms[i].chatroom}')">
//                     <img src="https://via.placeholder.com/50" alt="Placholder">
//                     <p>${data.chatrooms[i].chatroom}</p>
//                 </div>
//             `;
//         }
//
//         changeChatRoom(currentChatroom);
//     });

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
        let testpfp
        try {
            testpfp = currentRoomUsers.find(u => u.id === message.author).pfp
        } catch {
            testpfp = "https://via.placeholder.com/50x50"
        }

        let testusername
        try {
            testusername = currentRoomUsers.find(u => u.id === message.author).username
        } catch {
            testusername = 'Unavailable user'
        }
        chatListElement.innerHTML += `
            <div class="chat">
                <div class="chat-user">
                    <div>
                        <img src="${testpfp}" alt="skootskoot">
                        <p class="bold">${testusername}</p>
                    </div>
                    <div class="right-box">
                         <p class="bold"><i>${message.timestamp}</i></p>
                         <a onclick="deleteMessage(${message.id})" class="bold delete-X">X</a>
                    </div>
                </div>
                <p class="chat-message">${message.content.text}</p>
            </div>
        `;
    }

    document.querySelector(".chat:last-child").scrollIntoView(); // Scrolls to bottom of page
}

function loadChatrooms() {
    loadChatroomsPart2ElectricBoogaloo()

    changeChatRoom(currentChatroom, currentChatroomId)

    if (dialog === false) document.querySelector(".chatroom").firstElementChild.click()
}

function loadChatroomsPart2ElectricBoogaloo() {
    const chatroomBox = document.querySelector("#chatroom-list");

    chatroomBox.innerHTML = ''

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



    chatroom = chatroomName
    currentChatroom = chatroomName
    currentChatroomId = chatroomId

    localStorage['currentChatroom'] = currentChatroom
    localStorage['currentChatroomId'] = chatroomId
    $("#sendMessage").val('')

    fetchMessages().then(() => loadChat())

    await fetchChatroomDetails()

    $("#current-chatroom-name").text(chatroomDetails.name)
    $("#current-chatroom-code").text(chatroomDetails.code)
    $("#edit-chatroom-name").val(chatroomDetails.name)
    $("#edit-chatroom-password").val(chatroomDetails.pass)
    $("#edit-chatroom-image").val(chatroomDetails.image)
}

// Renews auth token
async function getUserChatrooms()
{
    await checkIfAuthTokenExpired()

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

if (!dialog)
{
    document.querySelector("#cookie-dialog").showModal()
}

function closeCookieConsent(dialogName) {
    dialog = true;
    localStorage['dialog'] = dialog
    closeDialog(dialogName)
}

async function createChatroom(dialogName) {
    closeDialog(dialogName)

    chatroomName = $("#create-chatroom-name").val()

    await checkIfAuthTokenExpired()

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

        await getUserChatrooms().then(() => loadChatrooms())

        document.querySelector(".chatroom").firstElementChild.click() // Clicks on newest chatroom

        // Reopen the websocket or sumshit
        ws.close();
        openWebsocketConnection();
    }
}

async function joinChatroom(dialogName) {
    closeDialog(dialogName)

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

    await getUserChatrooms().then(() => loadChatrooms())

    $("#join-chatroom-code").val('')
    $("#join-chatroom-password").val('')
}

// TODO: Opens a dialog box that asks if you really want to leave the group

async function leaveChatroom(chatroomid) {

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

    localStorage['currentChatroom'] = currentChatroom

    //await sendSystemMessage(' left the chatroom', 'leave')

    await getUserChatrooms().then(() => loadChatrooms())

    // Make sure the click code doesnt throw an error
    chatroom = undefined;

    document.querySelector(".chatroom").firstElementChild.click()
}

async function fetchChatroomDetails() {
    await checkIfAuthTokenExpired()

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

function loadUserList(list) {
    const userlist = document.querySelector("#user-list");

    userlist.innerHTML = ''

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

async function editChatroom() {
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

    if (dev) console.log(response)

    closeDialog('edit-chatroom-dialog')

    getUserChatrooms().then(() => loadChatrooms())
}

async function deleteMessage(id) {
    await checkIfAuthTokenExpired()

    // Deletes message with api
    chatroomResult = (await axios({
        method: 'post',
        url: api + 'chat/room/message/delete',
        headers: {
            Authorization: 'Bearer ' + authToken
        },
        data: {
            MessageId: id
        }
    })).data;

    message = JSON.stringify({
        "type": "delete",
        "room": JSON.parse(localStorage['currentChatroomId']),
        "id": id
    });
    if (dev) console.debug(message);
    ws.send(message);

    const spliceIndex = messages.indexOf(m => m.id === id);
    messages.splice(spliceIndex, 1);
}



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

sendMessage = $("#sendMessage")

// Sends message to ws
sendMessage.keypress(function (e)
{
    if (e.which === 13 && !e.shiftKey)
    {
        e.preventDefault();
        $(this).closest("form").submit();
        if (document.querySelector("#sendMessage").value.length >= 1) {
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
            ws.send(message);
            $("#sendMessage").val('')

        }
        // document.querySelector(".chat:last-child").style.color = red;
    }
});

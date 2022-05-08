// Sets the current chatroom from localstorage
currentChatroom = localStorage['currentChatroom'] || 'chatroom-dummy';

currentChatroomId = localStorage['currentChatroomId']

let chatroom = "chatroom-dummy";

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
            ChatroomId: localStorage['currentChatroomId'],
            Start: 1,
            Length: 500
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

        chatListElement.innerHTML += `
            <div class="chat">
                <div class="chat-user">
                    <div>
                        <img src="${currentRoomUsers.find(u => u.id === message.author).pfp}" alt="skootskoot">
                        <p class="bold">${currentRoomUsers.find(u => u.id === message.author).username}</p>
                    </div>
                    <p class="bold"><i><sub>${message.timestamp}</sub></i></p>
                </div>
                <p class="chat-message">${message.content.text}</p>
            </div>
        `;
    }
    document.querySelector(".chat:last-child").scrollIntoView(); // Scrolls to bottom of page
}

function loadChatrooms() {
    const chatroomBox = document.querySelector("#chatroom-list");

    chatroomBox.innerHTML = ''

    chatroomBox.innerHTML += `<div id="chatroom-dummy"></div>`

    for (const chatroom of chatroomList)
    {
        chatroomBox.innerHTML += `
                <div id="chatroom-${chatroom.id}" class="list-card" onclick="changeChatRoom('chatroom-${chatroom.id}', ${chatroom.id})">
                    <div class="list-card-info">
                        <img src="${chatroom.image}" alt="Placholder">
                        <p>${chatroom.name}</p>
                    </div>
                    <a class="" onclick="leaveChatroom(${chatroom.id})">x</a>
                </div>
            `;
    }
    changeChatRoom(currentChatroom)
}



// Changes chat room and highlight colours
async function changeChatRoom(chatroomName, chatroomId)
{
    //oldchatroomname = chatroom || "chatroom-alpha";
    document.querySelector("#" + chatroom).style.backgroundColor = "#40446e";
    document.querySelector("#" + chatroomName).style.backgroundColor = "#123";
    // document.querySelector("#" + chatroom).classList.add =

    chatroom = chatroomName
    currentChatroom = chatroomName

    localStorage['currentChatroom'] = currentChatroom
    localStorage['currentChatroomId'] = chatroomId || currentChatroomId
    $("#sendMessage").val('')

    fetchMessages().then(() => loadChat())

    await fetchChatroomDetails()

    $("#current-chatroom-name").text(chatroomDetails.name)
    $("#current-chatroom-code").text(chatroomDetails.code)
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

    await checkIfAuthTokenExpired()

    // Creates chatroomList with API
    chatroomResult = (await axios({
        method: 'post',
        url: api + 'chat/room/create',
        headers: {
            Authorization: 'Bearer ' + authToken
        },
        data: {
            Name: $("#create-chatroom-name").val(),
            Pass: $("#create-chatroom-password").val()
        }
    })).data;

    if (dev) console.debug(chatroomResult)

    if (chatroomResult)
    {
        if (dev) console.debug('your mom')
    }

    await getUserChatrooms().then(() => loadChatrooms())
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

    await getUserChatrooms().then(() => loadChatrooms())
}

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

    chatroom = "chatroom-dummy"
    currentChatroom = "chatroom-dummy"
    localStorage['currentChatroom'] = currentChatroom

    await getUserChatrooms().then(() => loadChatrooms())
}

async function fetchChatroomDetails() {
    await checkIfAuthTokenExpired()

    // Leave chatroomList with API
    chatroomDetails = (await axios({
        method: 'post',
        url: api + 'chat/room/details',
        headers: {
            Authorization: 'Bearer ' + authToken
        },
        data: {
            ChatroomId: localStorage['currentChatroomId']
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

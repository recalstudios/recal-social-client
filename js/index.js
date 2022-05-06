// Sets the current chatroom from localstorage
currentChatroom = localStorage['currentChatroom'] || 'chatroom-dummy';

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
            Length: 1000000
        },
        headers: {
            Authorization: 'Bearer ' + authToken
        }
    })).data.messages;

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
    const chatListElement = document.querySelector("#chat-list");

    chatListElement.innerHTML = ''; // Clears previous chat log
    for (const message of messages)
    {

        chatListElement.innerHTML += `
            <div class="chat">
                <div class="chat-user">
                    <img src="https://via.placeholder.com/50x50" alt="skootskoot">
                    <p class="bold">${await getUserUsingId(message.author)}‎‎‎‎‎‎‎‎ㅤ‎‎‎‎‎‎‎‎ㅤ‎‎‎‎‎‎‎‎ㅤ‎‎‎‎‎‎‎‎ㅤ‎‎‎‎‎‎‎‎ㅤ‎‎‎‎‎‎‎‎ㅤ‎‎‎‎‎‎‎‎ㅤ‎‎‎‎‎‎‎‎ㅤ‎‎‎‎‎‎‎‎ㅤ‎‎‎‎‎‎‎‎ㅤ‎‎‎‎‎‎‎‎ㅤ‎‎‎‎‎‎‎‎ㅤ‎‎‎‎‎‎‎‎ㅤ‎‎‎‎‎‎‎‎ㅤ‎‎‎‎‎‎‎‎ㅤ‎‎‎‎‎‎‎‎ㅤ‎‎‎‎‎‎‎‎ㅤ</p>
                    <p class="bold">${message.timestamp}</p>
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
                <div id="chatroom-${chatroom.id}" class="chatroom" onclick="changeChatRoom('chatroom-${chatroom.id}', ${chatroom.id})">
                    <div class="chatroom-info">
                        <img src="https://via.placeholder.com/50" alt="Placholder">
                        <p>${chatroom.name}</p>
                    </div>
                    <a class="" onclick="leaveChatroom(${chatroom.id})">x</a>
                </div>
            `;
    }
    changeChatRoom(currentChatroom)
}



// Changes chat room and highlight colours
function changeChatRoom(chatroomName, chatroomId)
{
    //oldchatroomname = chatroom || "chatroom-alpha";
    document.querySelector("#" + chatroom).style.backgroundColor = "#40446e";
    document.querySelector("#" + chatroomName).style.backgroundColor = "#123";
    // document.querySelector("#" + chatroom).classList.add =

    chatroom = chatroomName
    currentChatroom = chatroomName

    localStorage['currentChatroom'] = currentChatroom
    localStorage['currentChatroomId'] = chatroomId || "1"
    $("#sendMessage").val('')

    fetchMessages().then(() => loadChat())
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

    console.log(chatroomList)
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

    console.log(chatroomResult)

    if (chatroomResult)
    {
        console.log('your mom')
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

function findCorrectUser(id) {
    return "ayour mom"
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
            //console.log(message);
            ws.send(message);
            $("#sendMessage").val('')
        }
        // document.querySelector(".chat:last-child").style.color = red;
    }
});

///////////////////////////////////////////////////////////////////////
 const ws = new WebSocket("ws://10.80.18.182/");// Opens websocket connection
//const ws = new WebSocket("ws://ws.social.recalstudios.net");// Opens websocket connection

// After connection is established send this message
ws.onopen = e => {
    checkIfAuthTokenExpired()

    console.log("open", e);
    ws.send(JSON.stringify({
        "type": "auth",
        "token": "Bearer " + authToken
    }));
    return false;
}

// What to do when receives a message
ws.onmessage = e => {
    const receivedData = JSON.parse(e.data);

    if (receivedData.type === "message")
    {
        user = JSON.parse(localStorage['user']);
        messages.push(receivedData);
        loadChat();
    }
}

ws.onclose = () => {
    setTimeout(ws.open, 5000)
}

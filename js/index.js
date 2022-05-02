// Sets the current chatroom from localstorage
currentChatroom = localStorage['currentChatroom'] || 'chatroom-1';

let chatroom = "chatroom-1";

checkIfLoggedIn()

//axios.post('URL', data, {
//    withCredentials: true
//});

// let element = document.getElementById('focus');
// element.scrollTop = element.offsetHeight



// Fetches messages from test json file
async function fetchMessages()
{
    // authToken = localStorage['token']
    //
    // messages = (await axios({
    //     method: 'post',
    //     url: api + 'chat/room/backlog',
    //     data: {
    //         ChatroomId: 1,
    //         Start:1,
    //         Length:10000
    //     },
    //     headers: {
    //         Authorization: 'Bearer ' + authToken
    //     }
    // })).data.messages;
    //
    // loadChat()

    //Dynamically loads content
    fetch("/js/json/chatroom-alpha.json")
        .then(response => response.json())
        .then(data =>
        {
            messages = data
            loadChat()
        });
}

// Loads the chat from the current chat room
function loadChat()
{
    const chatListElement = document.querySelector("#chat-list");

    chatListElement.innerHTML = ''; // Clears previous chat log
    for (const message of messages)
    {
        chatListElement.innerHTML += `
            <div class="chat">
                <div class="chat-user">
                    <img src="${publicUser.pfp}" alt="skootskoot">
                    <p class="bold">${message.author}</p>
                </div>
                <p class="chat-message">${message.content.text}</p>
            </div>
        `;


    }

    document.querySelector(".chat:last-child").scrollIntoView(); // Scrolls to bottom of page
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
getUserChatrooms().then(() => loadChatrooms())

fetchMessages()

function loadChatrooms() {
    const chatroomBox = document.querySelector("#chatroom-list");

    chatroomBox.innerHTML = ''

    for (const chatroom of chatroomList)
    {
        chatroomBox.innerHTML += `
                <div id="chatroom-${chatroom.id}" class="chatroom" onclick="changeChatRoom('chatroom-${chatroom.id}', ${chatroom.id})">
                    <img src="https://via.placeholder.com/50" alt="Placholder">
                    <p>${chatroom.name}</p>
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
    localStorage['currentChatroomId'] = chatroomId
    $("#sendMessage").val('')
    //fetchMessages()
}

// Renews auth token
async function getUserChatrooms()
{
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
    document.querySelector("#dialog").style.display = "initial"
}

function closeDialog() {
    dialog = true;
    localStorage['dialog'] = dialog
    document.querySelector("#dialog").style.display = "none";
}

async function createChatroom() {
    // Creates chatroomList with API
    chatroomResult = (await axios({
        method: 'post',
        url: api + 'chat/room/create',
        headers: {
            Authorization: 'Bearer ' + authToken
        },
        data: {
            Name:"testeteste" + int,
            Pass:"root"
        }
    })).data;

    console.log(chatroomResult)

    if (chatroomResult)
    {
        console.log('your mom')
    }

    await getUserChatrooms().then(() => loadChatrooms())
}

intCounter()

function intCounter() {
    int = Math.floor(Math.random() * 10000);
    JSON.parse(int);
    console.log(int)
}

async function joinChatroom() {
    // Joins chatroomList with API
    chatroomResult = (await axios({
        method: 'post',
        url: api + 'chat/room/join',
        headers: {
            Authorization: 'Bearer ' + authToken
        },
        data: {
            Code: prompt("Insert room code here"),
            Pass: prompt("Insert password for room here")
        }
    })).data;

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
                "room": 1,
                "author": user.username,
                "content": {
                    "attachments": [
                        {
                            "type": "image",
                            "src": "https://via.placeholder.com/50"
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
// const ws = new WebSocket("ws://10.111.59.109:14242/");// Opens websocket connection
const ws = new WebSocket("ws://ws.social.recalstudios.net:14242");// Opens websocket connection

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

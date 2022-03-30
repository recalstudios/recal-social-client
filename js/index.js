let currentChatroom;
let frmfcs;

currentChatroom = localStorage['currentChatroom'] || '/js/chatroom-alpha.json';

//axios.post('URL', data, {
//    withCredentials: true
//});


// onload= function() {
//     frmfcs = document.getElementById('focus');
//     frmfcs.focus();
// }

// let element = document.getElementById('focus');
// element.scrollTop = element.offsetHeight


loadChat()

function loadChat() {
    document.querySelector("#chat-list").innerHTML = ` `

    // Dynamically loads content
    fetch("/js/" + currentChatroom + ".json")
        .then(response => response.json())
        .then(data =>
        {
            for (let i = 0; i < data.messages.length; i++)
            {
                document.querySelector("#chat-list").innerHTML += `
                <div class="chat">
                    <div class="chat-user">
                        <img src="${data.messages[i].chatterimage}" alt="skootskoot">
                        <p class="bold">${data.messages[i].author}</p>
                        </div>
                    <p class="chat-message">${data.messages[i].message}</p>
                </div>
            `;
            }

            scroll().then()
        });
}

// Dynamically loads content
fetch("/js/testchatrooms.json")
    .then(response => response.json())
    .then(data =>
    {
        for (let i = 0; i < data.chatrooms.length; i++)
        {
            document.querySelector("#chatroom-list").innerHTML += `
                <div id="${data.chatrooms[i].chatroom}" class="chatroom" onclick="changeChatRoom('${data.chatrooms[i].chatroom}')">
                    <img src="https://via.placeholder.com/50" alt="Placholder">
                    <p>${data.chatrooms[i].chatroom}</p>
                </div>
            `;
        }

        changeChatRoom(currentChatroom)
    });

let chatroom = "chatroom-alpha";

function changeChatRoom(chatroomId) {

    //oldchatroomname = chatroom || "chatroom-alpha";

    document.querySelector("#" + chatroom).style.backgroundColor = "#40446e";

    document.querySelector("#" + chatroomId).style.backgroundColor = "#123";
    // document.querySelector("#" + chatroom).classList.add =

    chatroom = chatroomId

    currentChatroom = chatroomId

    localStorage['currentChatroom'] = currentChatroom

    loadChat()
}

async function scroll() {
    let myDiv = document.querySelector("#chat-list");
    myDiv.scrollTop = myDiv.scrollHeight;
}

///////////////////////////////////////////////////////////////////////
const ws = new WebSocket("ws://10.80.18.182:14242/anything");

ws.onclose = e => console.log("closed", e);

ws.onopen = e =>
{
    console.log("open", e);
    ws.send(JSON.stringify({
        "author": "little",
        "data": "soni is not cool"
    }));
    return false;
}

ws.onmessage = e =>
{
    console.log(e.data);
    return false;
}

ws.onerror = e => console.log("error", e);

function send(e)
{
    ws.send(e)
}
//axios.post('URL', data, {
//    withCredentials: true
//});

// Dynamically loads content
fetch("/js/testchat.json")
    .then(response => response.json())
    .then(data =>
    {
        for (let i = 0; i < data.messages.length; i++)
        {
            document.querySelector("#chat-list").innerHTML += `
                <div class="chat">
                    <img src="${data.messages[i].chatterimage}" alt="skootskoot">
                    <div class="author-message-box">
                        <p class="bold">${data.messages[i].author}</p>
                        <p>${data.messages[i].message}</p>
                    </div>
                </div>
            `;
        }
    });

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
    });

// const ws = new WebSocket("ws://10.80.18.182:14242/anything");
//
// ws.onclose = () => console.log("yo mom");
//
// ws.onopen = () =>
// {
//     console.log("hi there");
//     ws.send(JSON.stringify({
//         "author": "little",
//         "data": "soni is not cool"
//     }));
//     return false;
// }
//
// ws.onmessage = e =>
// {
//     console.log(JSON.parse(e.data));
//     return false;
// }

let chatroomname = "a"

function changeChatRoom(chatroom) {

    document.querySelector("#" + chatroomname).style.backgroundColor = "#40446e";

    console.log("your mco")

    document.querySelector("#" + chatroom).style.backgroundColor = "#123";
    document.querySelector("#" + chatroom).classList.add =


    chatroomname = chatroom
}

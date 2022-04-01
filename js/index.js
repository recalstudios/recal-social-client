let currentChatroom;
let messages;
let message;

currentChatroom = localStorage['currentChatroom'] || '/js/chatroom-alpha.json';

//axios.post('URL', data, {
//    withCredentials: true
//});

// let element = document.getElementById('focus');
// element.scrollTop = element.offsetHeight


fetchMessages()

function fetchMessages() {

    // Dynamically loads content
    fetch("/js/" + currentChatroom + ".json")
        .then(response => response.json())
        .then(data =>
        {
            messages = data

            loadChat()

        });
}

function loadChat() {
  document.querySelector("#chat-list").innerHTML = ''
  for (const message of messages)
  {
    document.querySelector("#chat-list").innerHTML += `
      <div class="chat">
          <div class="chat-user">
              <img src="${message.chatterimage}" alt="skootskoot">
              <p class="bold">${message.author}</p>
              </div>
          <p class="chat-message">${message.message}</p>
      </div>
  `;
  }

  document.querySelector(".chat:last-child").scrollIntoView(); // Scrolls to bottom of page
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

    $("#sendMessage").val('')

    fetchMessages()
}

$("#sendMessage").keypress(function (e) {
    if(e.which === 13 && !e.shiftKey) {
        e.preventDefault();

        $(this).closest("form").submit();

        message = JSON.stringify({"type":"message", "data":$("#sendMessage").val()});

        console.log(message);

        ws.send(message);

        $("#sendMessage").val('')

        // document.querySelector(".chat:last-child").style.color = red;
    }
});

///////////////////////////////////////////////////////////////////////
const ws = new WebSocket("ws://10.80.18.182:14242/");

ws.onclose = e => console.log("closed", e);

ws.onopen = e =>
{

    console.log("open", e);
    ws.send(JSON.stringify({
        "type": "auth"
    }));
    return false;
}

ws.onmessage = e =>
{
    console.log(e.data);
    messages.push(
      {
      "author": "test",
      "chatterimage": "https://via.placeholder.com/50",
      "message": e.data
      })
    loadChat()

    // document.querySelector(".chat:last-child").style.color = initial;
    return false;
}

ws.onerror = e => console.log("error", e);
3

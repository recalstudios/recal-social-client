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

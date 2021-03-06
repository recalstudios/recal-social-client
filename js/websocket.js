// Declare the WebSocket
let ws;

// Global variable for debugging network
let debuggingNetwork = false;

// Function for opening the WebSocket
function openWebsocketConnection()
{
    // Open the WebSocket
    ws = new WebSocket(wsUrl);

    // Register message receive callback
    ws.onmessage = message =>
    {
        // Parse data as JSON object
        const data = JSON.parse(message.data);

        // Log data to console
        if (debuggingNetwork) console.debug("[Network Debug] Received data from WebSocket: " + JSON.stringify(data));

        // Determine type of object
        switch (data.type)
        {
            case "status":
                switch (data.data)
                {
                    case "auth":
                        // Authenticate the session
                        ws.send(JSON.stringify({
                            "type": "auth",
                            "token": "Bearer " + authToken
                        }));
                        break;
                    case "ok":
                        // Authentication was successful
                        console.info("Successfully authenticated to the WebSocket!");
                }
                break;
            case "invalid":
                // We sent invalid data, warn user
                console.error("WebSocket responded with invalid data from us: " + data.data);
                break;
            case "message":
                // Received message, load it
                messages.push(data);
                loadChat().then(() => console.log("Loaded chat"));

                const newestRoom = chatroomList.filter(e => e.id === data.room);
                chatroomList = chatroomList.filter(e => e.id !== data.room);
                chatroomList.unshift(newestRoom[0]);

                // This is not tested but apparently it works idk
                loadsMessagesInChatroom()
                document.querySelector("#" + currentChatroom).style.backgroundColor = "#123";
                break;
            case "system":
                // System message

                const lastElement = messages[messages.length - 1];
                console.log(data)

                const output = {
                    "id": 0,
                    "room": data.room,
                    "author": 0, // FIXME: This is bad, but works for now :)
                    "content": {
                        "text": data.content
                    },
                    "timestamp": "asdasdfsdf"
                }
                messages.push(output);
                loadChat().then(() => console.log("Loaded chat"));

                // TODO: Do your shit here littel
                break;
            case "delete":
                // Delete message if type is delete
                if (parseInt(localStorage['currentChatroomId']) === data.room)
                {
                    const spliceIndex = messages.findIndex(m => m.id === data.id);
                    messages.splice(spliceIndex, 1);
                }
                loadChat();
        }
    }

    // WebSocket termination callback
    ws.onclose = () =>
    {
        // Reopen socket after timeout
        console.warn("WebSocket dropped connection, attempting reconnect after 5 seconds");
        setTimeout(() => openWebsocketConnection(), 5000);
    }
}

// Function for debugging networking code
// This function is meant for being run in the browser console
function toggleNetworkDebug(state = !debuggingNetwork)
{
    debuggingNetwork = state;

    if (debuggingNetwork) console.info("Entering network debug mode");
    else console.info("Exited network debug mode");
}
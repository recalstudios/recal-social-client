// Declare the WebSocket
let ws;

/**
 * Global variable for storing whether network debugging is active.
 *
 * @type {boolean}
 *
 * @author Soni
 *
 * @see The function for toggling network debug: {@link toggleNetworkDebug}
 */
let debuggingNetwork = false;

// ---------------------------------------------------------------------------------------------------------------------

/**
 * This function opens the websocket connection. It also declares how the WebSocket should react to certain received
 * data.
 *
 * @author Little
 *
 * @see A JavaScript WebSocket: {@link WebSocket}
 */
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

                // Move the chatroom to the top of the list (because there's a new message)
                const newestRoom = chatroomList.filter(e => e.id === data.room);
                chatroomList = chatroomList.filter(e => e.id !== data.room);
                chatroomList.unshift(newestRoom[0]);

                // This is not tested but apparently it works idk
                // I also have no idea what it is supposed to do or why it is here
                loadsMessagesInChatroom()
                document.querySelector("#" + currentChatroom).style.backgroundColor = "#123";
                break;
            case "system":
                // System message
                console.log(data)

                const output = {
                    "id": 0,
                    "room": data.room,
                    "author": 0, // FIXME: This is bad, but works for now :)
                    "content": {
                        "text": data.content
                    },
                    "timestamp": "asdasdfsdf" // okay?
                }
                messages.push(output);
                loadChat().then(() => console.log("Loaded chat"));

                // TODO: Do your shit here littel
                break;
            case "delete":
                // Delete message if type is delete
                // Check if the deleted message is in the active chatroom
                if (parseInt(localStorage['currentChatroomId']) === data.room)
                {
                    // Find the message and delete it
                    const spliceIndex = messages.findIndex(m => m.id === data.id);
                    messages.splice(spliceIndex, 1);
                }

                // Reload the chat
                loadChat().then(() => console.log('Reloaded chat'));
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

/**
 * This function helps debug networking code by printing more networking information to the console. It is meant for
 * being run in the browser console.
 *
 * @param {boolean} state - An optional parameter to specify whether the debugging should be enabled or disabled,
 * instead of toggling.
 *
 * @author Soni
 *
 * @see The global variable that stores whether network debugging is active: {@link debuggingNetwork}
 */
function toggleNetworkDebug(state = !debuggingNetwork)
{
    debuggingNetwork = state;

    if (debuggingNetwork) console.info("Entering network debug mode");
    else console.info("Exited network debug mode");
}

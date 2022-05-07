// Declare and open the WebSocket
let ws = new WebSocket(wsUrl);

// Global variable for debugging network
let debuggingNetwork = false;

// Message receive callback
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
                    break;
                case "closed":
                    // Reopen socket on termination
                    console.warn("WebSocket dropped connection, attempting reconnect after 5 seconds");
                    setTimeout(() => ws = new WebSocket(wsUrl), 5000);
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
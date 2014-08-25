var socket = global.socket;

socket.on("register.ok", function() {
    global.sceneManager.sendEventToCertainScene("start", "register.ok");
});

socket.on("register.error", function() {
    global.sceneManager.sendEventToCertainScene("start", "register.error");
});

socket.on("room.created", function(players) {
    global.sceneManager.sendEventToCertainScene("start", "room.created", players);
});

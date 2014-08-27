require("sugar");
require("./lib/common");
var config = require("./config");
var io = require("socket.io")();

global.server = io;

// 新 bot 链接
io.on("connection", function(socket) {
    console.log("New bot connected...");

    // on disconnect
    socket.on("disconnect", function() {
        console.log("Bot disconnected...");

        // remove from player...
        var pool = require("./server/lib/playerPool");
        if(socket.extra && socket.extra.name) {
            pool.removePlayer(socket.extra.name);
        }
    });

    // on start scene
    require("./server/startEvent")(socket);

    // on room scene
    require("./server/roomEvent")(socket);
});

io.listen(config.server.port);
console.log("Server listening on port " + config.server.port + "...");

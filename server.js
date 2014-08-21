require("sugar");
require("./config");
var io = require("socket.io")();

// 新 bot 链接
io.on("connection", function(socket) {
    console.log("New bot connected...");
    console.log(socket);

    // on disconnect
    socket.on("disconnect", function() {
        console.log("Bot disconnected...");
    });
});

io.listen(config.server.port);
console.log("Server listening on port " + config.server.port + "...");


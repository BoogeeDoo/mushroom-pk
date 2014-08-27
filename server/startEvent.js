var pool = require("./lib/playerPool");
var config = require("../config");
var Scarlet = require("scarlet-task");
var Room = require("./lib/room");

var scarlet = new Scarlet(1);

function makeRoom(TO) {
    var pool = TO.task;
    var players = pool.getAllPlayers();

    var playList = [];
    for(var key in players) {
        if(players[key] && players[key].room === null) {
            playList.push(players[key]);
        }

        if(playList.length === config.rule.playersPerRoom) break;
    }

    // 未形成有效配对
    if(playList.length !== config.rule.playersPerRoom) {
        return scarlet.taskDone(TO);
    }

    var room = new Room(playList);

    // 给每个玩家发送组队成功信息
    var message = playList.map(function(p) { return p.getJSON(); });
    console.log(message);
    room.send("room.created", message);

    scarlet.taskDone(TO);
}

module.exports = function(socket) {
    socket.on("register", function(name) {
        console.log(socket.id + " 正在注册 【" + name + "】。");

        pool.addPlayer(name, socket, function(err, sock) {
            if(err) {
                return socket.emit("register.error");
            }

            socket.emit("register.ok");

            // 查找有没有配对的
            scarlet.push(pool, makeRoom);
        });
    });

    socket.on("game.room.ready", function(name) {
        console.log(name + " 准备完毕...");

        var player = pool.getPlayerByName(name);
        player.ready = true;

        var room = player.room;
        if(room.allReady()) {
            room.newGame();
        }
    });
};

var _pool = {};
var Player = require("./player");

exports.addPlayer = function(name, socket, callback) {
    if(_pool[name]) {
        return callback(new Error("Name exists."));
    }

    var player = new Player(socket, name);
    player.setStatus("queuing");

    _pool[name] = player;

    socket.extra = {
        name    : name
    };

    callback(undefined, socket);
};

exports.getPlayerByName = function(name) {
    return _pool[name];
};

exports.removePlayer = function(name) {
    delete _pool[name];
};

exports.getAllPlayers = function() { return _pool; };


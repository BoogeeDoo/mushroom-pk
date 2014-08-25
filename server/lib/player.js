var Player = function(socket, name) {
    this.socket = socket;
    this.name = name;
    this.status = "queuing";

    this.id = this.socket.id;

    this.room = null;
    this.teamNumber = null;
};

Player.prototype.setStatus = function(status) {
    this.status = status;
};

Player.prototype.send = function(router, message) {
    this.socket.emit(router, message);
};

Player.prototype.getJSON = function() {
    var json = {
        name    : this.name,
        id      : this.id,
        teamNumber  : this.teamNumber
    };
    return json;
};

module.exports = Player;


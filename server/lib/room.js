var config = require("../../config");

var Room = function(players) {
    this.players = players.shuffle();

    // 分成两队
    this.teams = this.players.inGroupsOf(config.rule.playersPerTeam);

    // 各成员绑定
    for(var i = 0; i < this.players.length; i++) {
        this.players[i].room = this;
        this.players[i].status = "rooming";
    }

    // 各成员队伍绑定
    for(var i = 0; i < this.teams.length; i++) {
        for(var j = 0; j < this.teams[i].length; j++) {
            this.teams[i][j].teamNumber = i;
        }
    }
};

Room.prototype.send = function(router, message) {
    for(var i = 0; i < this.players.length; i++) {
        this.players[i].send(router, message);
    }
};

Room.prototype.sendToTeam = function(teamNumber, router, message) {
    if(teamNumber >= this.teams.length) return;
    var team = this.teams[teamNumber];
    for(var i = 0; i < team.length; i++) {
        if(!team[i]) continue;
        team[i].send(router, message);
    }
};

Room.prototype.sendToTeamByPlayer = function(player, router, message) {
    var teamNumber = player.teamNumber;
    this.sendToTeam(teamNumber, router, message);
};

module.exports = Room;


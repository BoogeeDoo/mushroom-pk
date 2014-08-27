var config = require("../../config");
var moment = require("moment");

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

Room.prototype.playerAttack = function(source, skillIdx, target) {
    source = this.getPlayer(source);
    if(source === null) return;

    target = this.getTeamPlayer(target, source.teamNumber ^ 1);
    if(target === null) return;

    var skill = source.skills[skillIdx];

    this.send("game.skill.released", { idx: skillIdx, enemy: target.name, source: source.name, skillName: skill.name, group: false });

    // 看看目标是否存活
    if(!target.property.alive) {
        var message = {
            players : [],
            text    : [
                "【" + source.name + "】对【" + target.name + "】施展了 [" + skill.name + "]，但是对方早就死了。"
            ]
        };
        this.send("game.players.updateStat", message);
        console.log("~~~~~~~~~~~~~~~~~~~||");
        console.log(message.text);
        console.log("~~~~~~~~~~~~~~~~~~~||");
        return;
    }

    // 刺杀对方
    var text = target.attackedBy(source, skill);
    var player = target.getJSON();
    player.values = target.getValues();
    var message = {
        players     : [ player ],
        text        : [ text ]
    };
    console.log("~~~~~~~~~~~~~~~~~~~||");
    console.log(message.text);
    console.log("~~~~~~~~~~~~~~~~~~~||");;

    this.send("game.players.updateStat", message);
};

Room.prototype.playerAttackGroup = function(source, skillIdx) {
    source = this.getPlayer(source);
    if(source === null) return;

    var message = {
        players     : [],
        text        : []
    };

    var skill = source.skills[skillIdx];
    skill.lastUse = +moment();

    var tm = source.teamNumber ? 0 : 1;
    for(var i = 0; i < this.teams[tm].length; i++) {
        var text = this.teams[tm][i].attackedBy(source, skill);

        var json = this.teams[tm][i].getJSON();
        json.values = this.teams[tm][i].getValues();

        message.players.push(json);
        message.text.push(text);
    }

    // 先给攻击者发送技能释放消息
    this.send("game.skill.released", { idx: skillIdx, skillName: skill.name, source: source.name, group: true });

    console.log("~~~~~~~~~~~~~~~~~~~||");
    console.log(message.text);
    console.log("~~~~~~~~~~~~~~~~~~~||");

    // 广播玩家状态
    this.send("game.players.updateStat", message);
};

Room.prototype.allReady = function() {
    return this.players.reduce(function(result, player) {
        return result & !!player.ready;
    }, true);
};

Room.prototype.newGame = function() {
    for(var i = 0; i < this.players.length; i++) {
        this.players[i].initValues();
    }

    var players = this.players;

    // 游戏创建成功
    console.log(players);

    // 发送状态给每个人
    var message = {
        players     : []
    };
    for(var i = 0; i < this.players.length; i++) {
        var j = players[i].getJSON();
        j.values = players[i].getValues();

        message.players.push(j);
    }

    for(var i = 0; i < this.players.length; i++) {
        var msg = Object.clone(message, true);
        msg.mySkills = this.players[i].getSkills();

        // 发送...
        this.players[i].send("game.init", msg);
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

Room.prototype.getTeamPlayer = function(name, team) {
    for(var i = 0; i < this.teams[team].length; i++) {
        if(this.teams[team][i].name === name) return this.teams[team][i];
    }

    return null;
};

Room.prototype.getPlayer = function(name) {
    for(var i = 0; i < this.players.length; i++) {
        if(this.players[i].name === name) return this.players[i];
    }

    return null;
};

module.exports = Room;

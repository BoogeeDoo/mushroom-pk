var pool = require("./lib/playerPool");
var config = require("../config");
var Scarlet = require("scarlet-task");
var Room = require("./lib/room");

var scarlet = new Scarlet(1);

module.exports = function(socket) {
    socket.on("game.attack", function(param) {
        var name = param.name;
        var skillIdx = param.skillIdx;

        // 寻找玩家
        var player = pool.getPlayerByName(name);

        // 如果玩家死了就不继续了
        if(!player || !player.property.alive) return;

        // 技能
        var skill = player.skills[skillIdx];

        // 如果技能在 cd
        if(skill.isCD()) return;

        // 房间
        var room = player.room;
        if(room.gameEnd) return;

        // 开始打人
        console.log("on.game.attack -");
        console.log(param);
        console.log("----------------");

        if(skill.isGroupAttack) room.playerAttackGroup(name, skillIdx);
        else room.playerAttack(name, skillIdx, param.enemy);

        // 然后判断胜利
        var allDie = [ true, true ];
        for(var i = 0; i < 2; i++) {
            for(var j = 0; j < room.teams[i].length; j++) {
                if(room.teams[i][j].property.alive) {
                    allDie[i] = false;
                    break;
                }
            }
        }
        if(allDie[0] && allDie[1]) {
            room.gameEnd = true;
            room.send("game.end", { victory: -1 });
        } else if(allDie[0]) {
            room.gameEnd = true;
            room.send("game.end", { victory: 1 });
        } else if(allDie[1]) {
            room.gameEnd = true;
            room.send("game.end", { victory: 0 });
        }
    });
};

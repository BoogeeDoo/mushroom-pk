var socket = global.socket;

socket.on("game.init", function(message) {
    global.sceneManager.sendEventToCertainScene("room", "game.init", message.players, message.mySkills);
});

socket.on("game.skill.released", function(param) {
    global.sceneManager.sendEventToCertainScene("room", "game.skill.released", param.idx, param.skillName, param.source, param.group, param.enemy);
});

socket.on("game.players.updateStat", function(param) {
    global.sceneManager.sendEventToCertainScene("room", "game.players.updateStat", param);
});

socket.on("game.end", function(param) {
    global.sceneManager.sendEventToCertainScene("room", "game.end", param.victory);
});

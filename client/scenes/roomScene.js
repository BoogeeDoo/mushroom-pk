var BaseScene = require("../baseScene");
var config = require("../../config");
var util = require("util");
var moment = require("moment");
var cluster = require("cluster");

var RoomScene = function(id, autoDel) {
    BaseScene.call(this, id, autoDel);

    this.players = null;

    this.teamNumber = null;
    this.comrades = [];
    this.enemies = [];

    this.gameStarted = false;
    this.gameEnd = false;
    this.records = [];

    this.on("game.init", this.onNewGame.bind(this));
    this.on("game.skill.released", this.onSkillReleased.bind(this));
    this.on("game.players.updateStat", this.onPlayersUpdateStat.bind(this));
    this.on("game.end", this.onGameEnd.bind(this));
};

util.inherits(RoomScene, BaseScene);

RoomScene.prototype.init = function(players, callback) {
    this.players = players;

    for(var i = 0; i < players.length; i++) {
        if(players[i].name === global.name) {
            this.teamNumber = players[i].teamNumber;
            break;
        }
    }

    for(var i = 0; i < players.length; i++) {
        if(players[i].name === global.name) {
            this.comrades.unshift(players[i]);
        } else if(players[i].teamNumber === this.teamNumber) {
            this.comrades.push(players[i]);
        } else {
            this.enemies.push(players[i]);
        }
    }

    global.socket.emit("game.room.ready", global.name);

    callback();
};

RoomScene.prototype.onGameEnd = function(victoryTeam) {
    this.gameEnd = true;

    if(victoryTeam === -1) {
        this.records.push({ time: +moment(), text: "---===【Tie】===---"});
    } else {
        this.records.push({
            time: +moment(),
            text: ("---===【{situation}】===---").assign({ situation: victoryTeam === this.comrades[0].teamNumber ? "Victory" : "Defeat" })
        });
    }

    var v = (victoryTeam === -1) ? "『平』" : (victoryTeam === this.comrades[0].teamNumber ? "『勝』" : "『敗』");

    var log = "";
    log += "玩家名：" + global.name + " " + v + "\n";
    log += "最大血量：" + this.comrades[0].values.maxHp + "\t";
    log += "当前血量：" + this.comrades[0].values.currentHp;
    if(!this.comrades[0].values.alive) log += " [卒]";
    log += "\n";
    log += "【技能】\n";
    for(var i = 0; i < this.mySkills.length; i++) {
        log += "  ";
        log += "[" + this.mySkills[i].name + "]，";
        log += "攻 " + this.mySkills[i].attack + "，";
        log += "冷却 " + (this.mySkills[i].cd / 1000).format(0) + " 秒";
        if(this.mySkills[i].group) log += "，群。";
        else log += "。";
        log += "\n";
    }

    log += "【队友】\n";
    for(var i = 1; i < this.comrades.length; i++) {
        log += "  ";
        log += "【" + this.comrades[i].name + "】，最大生命 " + this.comrades[i].values.maxHp + "，";
        log += "当前生命 " + this.comrades[i].values.currentHp + "。";
        if(!this.comrades[i].values.alive) log += " [卒]";
        log += "\n";
    }

    log += "【对手】\n";
    for(var i = 0; i < this.enemies.length; i++) {
        log += "  ";
        log += "【" + this.enemies[i].name + "】，最大生命 " + this.enemies[i].values.maxHp + "，";
        log += "当前生命 " + this.enemies[i].values.currentHp + "。";
        if(!this.enemies[i].values.alive) log += " [卒]";
        log += "\n";
    }

    log += "=============== 战斗记录 ===============\n";

    // 写入文件
    var filename = __dirname + "/../../log/" + global.name + ".log";
    var string = this.records.reduce(function(log, record) {
        log += "[" + moment(record.time).format("HH:mm:ss.SSS") + "] ";
        log += record.text;
        log += "\n";

        return log;
    }, log);
    var fs = require("fs");
    fs.writeFileSync(filename, string);

    if(!cluster.isMaster) process.exit(0);
};

RoomScene.prototype.onSkillReleased = function(skillIdx, skillName, source, group, enemy) {
    try {
        // 记录状态
        var name = source;
        if (source === this.comrades[0].name) {
            name = "我";
            // 更新 cd
            var skill = this.mySkills[skillIdx];
            skill.leftCD = skill.cd;
            skill.releasing = false;
        }

        if (group) this.records.push({time: moment(), text: "【" + name + "】释放了群攻技能 [" + skillName + "]。"});
        else {
            this.records.push({time: moment(), text: "【" + name + "】对【" + enemy + "】释放了技能 [" + skillName + "]。"});
        }
    } catch(e) {
        while(1) console.log(e)
    }
};

RoomScene.prototype.onPlayersUpdateStat = function(param) {
    try {
        var stats = param.players;
        var text = param.text;

        for (var i = 0; i < stats.length; i++) {
            for (var j = 0; j < this.players.length; j++) {
                if (stats[i].name === this.players[j].name) {
                    this.players[j].values = stats[i].values;
                    break;
                }
            }
        }

        for (var i = 0; i < text.length; i++) {
            this.records.push({time: moment(), text: text[i].replace("【" + global.name + "】", "【我】") });
        }
    } catch(e) {
        while(1) console.log(e)
    }
};

RoomScene.prototype.onNewGame = function(players, mySkills) {
    for(var i = 0; i < players.length; i++) {
        var tn = players[i].teamNumber;
        var toTravel = (tn === this.teamNumber ? this.comrades : this.enemies);

        for(var j = 0; j < toTravel.length; j++) {
            var player = toTravel[j];

            if(player.name === players[i].name) {
                player.values = players[i].values;
                break;
            }
        }
    }

    this.mySkills = mySkills.map(function(skill) {
        skill.cd *= 1000;
        skill.leftCD = 0;
        skill.releasing = false;
        return skill;
    });
    this.gameStarted = true;

    this.records = [];
};

RoomScene.prototype.update = function(delta, callback) {
    if(!this.gameStarted) return callback();

    // 更新技能 cd
    for(var i = 0; i < 5; i++) {
        this.mySkills[i].leftCD -= delta;
        if(this.mySkills[i].leftCD < 0) this.mySkills[i].leftCD = 0;
    }

    // 先看技能，有技能没放就放
    var skills = [];
    for(var i = 0; i < 5; i++) {
        skills.push({ skill: this.mySkills[i], idx: i });
    }
    skills.shuffle();

    var enemies = [];
    for(var i = 0; i < this.enemies.length; i++) {
        enemies.push(this.enemies[i]);
    }
    enemies.shuffle(100);

    // 如果死了就不能放了
    if(!this.comrades[0].values.alive) {
        return callback();
    }

    if(this.gameEnd) return callback();

    for(var i = 0; i < 5; i++) {
        if(skills[i].skill.leftCD === 0 && !skills[i].skill.releasing) {
            var enemy = -1;
            for(var i = 0; i < enemies.length; i++) {
                if(!enemies[i].values.alive) continue;
                else {
                    enemy = i;
                    break;
                }
            }

            if(enemy === -1) {
                break;
            }

            var enemyName = enemies[enemy].name;

            // 发送技能
            skills[i].skill.releasing = true;
            global.socket.emit("game.attack", { name: global.name, skillIdx: skills[i].idx, enemy: enemyName });
            break;
        }
    }

    callback();
};

RoomScene.prototype.render = function(delta, callback) {
    this.renderer.clearCanvas();

    if(!this.gameStarted) {
        this.renderer.fillStyle = "green";
        for (var i = 0; i < this.comrades.length; i++) {
            this.renderer.fillText("【{name}】{alt}".assign({
                name: this.comrades[i].name,
                alt: i === 0 ? "*" : ""
            }), 5, i + 2);
        }
        this.renderer.fillStyle = "red";
        for (var i = 0; i < this.enemies.length; i++) {
            this.renderer.fillText("【{name}】".assign({name: this.enemies[i].name}), 5, i + 2 + this.comrades.length);
        }
    } else {
        // 先显示自己的名字和状态
        var display = "【{name}】*\tHP: {hp}\tAlive: {alive}".assign({
            name    : this.comrades[0].name,
            hp      : this.comrades[0].values.currentHp,
            alive   : this.comrades[0].values.alive
        });
        this.renderer.fillStyle = this.comrades[0].values.alive ? "blue" : "white";
        this.renderer.fillText(display, 5, 2);

        // 自己的技能
        skillDisplay = "";
        var skillDT = "[{name} ({attack}) <{cd}>]";
        for(var i = 0; i < 5; i++) {
            skillDisplay += skillDT.assign({ name: this.mySkills[i].name, attack: this.mySkills[i].attack, cd: (this.mySkills[i].leftCD / 1000).format(0) });
            if(this.mySkills[i].group) skillDisplay += "*";
            if(i !== 4) skillDisplay += "\t";
        }
        this.renderer.fillStyle = "cyan";
        this.renderer.fillText(skillDisplay, 5, 3);

        // 队友状态
        var dt = "【{name}】\tHP: {hp}\tAlive: {alive}";
        for(var i = 1; i < this.comrades.length; i++) {
            this.renderer.fillStyle = "green";

            // 如果死了就灰色
            if(!this.comrades[i].values.alive) this.renderer.fillStyle = "white";

            var display = dt.assign({
                name    : this.comrades[i].name,
                hp      : this.comrades[i].values.currentHp,
                alive   : this.comrades[i].values.alive
            });
            this.renderer.fillText(display, 5, 4 + i);
        }

        // 敌人状态
        for(var i = 0; i < this.comrades.length; i++) {
            this.renderer.fillStyle = "red";

            // 如果死了就灰色
            if(!this.enemies[i].values.alive) this.renderer.fillStyle = "white";

            var display = dt.assign({
                name    : this.enemies[i].name,
                hp      : this.enemies[i].values.currentHp,
                alive   : this.enemies[i].values.alive
            });
            this.renderer.fillText(display, 5, 4 + i + this.comrades.length);
        }

        // 下一行
        var startLine = 4 + this.comrades.length + this.enemies.length;

        // 总行数
        var totalLines = this.canvas.height;
        var leftLines = totalLines - startLine + 1;
        var startRecord = Math.max(this.records.length - leftLines, 0);

        this.renderer.fillStyle = "magenta";
        for(var i = startRecord, j = 0; i < this.records.length; i++, j++) {
            this.renderer.fillText("[{time}] {text}".assign({
                time    : moment(this.records[i].time).format("HH:mm:ss"),
                text    : this.records[i].text
            }), 5, startLine + j);
        }
    }

    callback();
};

module.exports = RoomScene;

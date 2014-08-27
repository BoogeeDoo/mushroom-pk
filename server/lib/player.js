var Skill = require("./skill");

var Player = function(socket, name) {
    this.socket = socket;
    this.name = name;
    this.status = "queuing";

    this.id = this.socket.id;

    this.room = null;
    this.teamNumber = null;
};

Player.prototype.initValues = function() {
    // 基础属性
    this.property = {
        alive       : true,
        maxHp       : 100,
        currentHp   : 100,

        escapeRate  : Number.random(10, 30)
    };

    // 技能属性
    this.skills = [];
    for(var i = 0; i < 5; i++) {
        this.skills.push(new Skill(!i));
        this.skills[i]._init();
    }
};

Player.prototype.attackedBy = function(source, skill) {
    // 死亡
    if(!this.property.alive) return "【" + source.name + "】对【" + this.name + "】施展了 [" + skill.name + "]，但是对方早就死了。";

    // 躲避
    var escapeNum = Number.random(1, 10000);
    var escapeRate = this.property.escapeRate * 100;
    if(skill.isGroupAttack) escapeRate *= 1.5;
    console.log("|||||||||||||| 闪避率：" + escapeRate + "，值：" + escapeNum + " ||||||||||||||");
    if(escapeNum < escapeRate) {
        return "【" + this.name + "】躲避了【" + source.name + "】的技能：" + skill.name + "。";
    }

    // 打中
    this.property.currentHp -= Math.min(this.property.currentHp, skill.attack);
    var display = "【" + this.name + "】被【" + source.name + "】的" + skill.name + "所伤，生命值变成了 " + this.property.currentHp + "。";
    if(this.property.currentHp === 0) {
        display += " [死亡]";
        this.property.alive = false;
    }

    return display;
};

Player.prototype.setStatus = function(status) {
    this.status = status;
};

Player.prototype.send = function(router, message) {
    this.socket.emit(router, message);
};

Player.prototype.getValues = function() {
    return this.property;
};

Player.prototype.getSkills = function() {
    return this.skills.map(function(skill) {
        return skill.getJSON();
    });
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

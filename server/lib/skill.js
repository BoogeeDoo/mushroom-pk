var skillNameGenerator = require("chinese-random-skill");
var moment = require("moment");

var Skill = function(isGroupAttack) {
    this.isGroupAttack = isGroupAttack;

    this.name = "";
    this.attack = 0;
    this.cd = 0;

    this.lastUse = 0;
};

Skill.prototype.isCD = function() {
    var now = +moment();
    return (now - this.lastUse < (this.cd * 1000));
};

Skill.prototype.getJSON = function() {
    return {
        group       : this.isGroupAttack,
        name        : this.name,
        attack      : this.attack,
        cd          : this.cd
    };
};

Skill.prototype._init = function() {
    this.name = skillNameGenerator.generate();

    if(this.isGroupAttack) {
        this.attack = Number.random(5, 10);
        this.cd = this.attack * 2;
    } else {
        this.attack = Number.random(10, 15);
        this.cd = this.attack;
    }
};

module.exports = Skill;

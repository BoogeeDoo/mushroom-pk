var BaseScene = require("../baseScene");
var config = require("../../config");
var util = require("util");

var RoomScene = function(id, autoDel) {
    BaseScene.call(this, id, autoDel);

    this.players = null;

    this.teamNumber = null;
    this.comrades = [];
    this.enemies = [];
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

    callback();
};

RoomScene.prototype.render = function(delta, callback) {
    this.renderer.clearCanvas();

    this.renderer.fillStyle = "green";
    for(var i = 0; i < this.comrades.length; i++) {
        this.renderer.fillText("【{name}】{alt}".assign({ name: this.comrades[i].name, alt: i === 0 ? "*" : "" }), 5, i + 2);
    }
    this.renderer.fillStyle = "red";
    for(var i = 0; i < this.enemies.length; i++) {
        this.renderer.fillText("【{name}】".assign({ name: this.enemies[i].name }), 5, i + 2 + this.comrades.length);
    }


    callback();
};

module.exports = RoomScene;

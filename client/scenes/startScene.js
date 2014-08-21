var BaseScene = require("../baseScene");
var util = require("util");
var nameGenerator = require("chinese-random-name");

/**
 * start scene
 *
 * @constructor
 * @param {String} id scene id
 */
var StartScene = function(id, autoDel) {
    BaseScene.call(this, id, autoDel);

    this.toGenerateName = true;
    this.name = "";
};

util.inherits(StartScene, BaseScene);

/**
 * update
 *
 * @param {Number} delta
 * @param {Function} callback
 */
StartScene.prototype.update = function(delta, callback) {
    if(this.toGenerateName) {
        // 起名字
        this.name = nameGenerator.generate();
        this.toGenerateName = false;

        // 把名字传过去
        global.socket.send("abc", function(name) {
            
        });
    }

    callback();
};

StartScene.prototype.render = function(delta, callback) {
    var fpsDisplay = this.fps.format(2) + " FPS";
    this.renderer.clearCanvas();

    this.renderer.fillStyle = "red";
    this.renderer.fillText(fpsDisplay, 5, 2);

    callback();
};

module.exports = StartScene;


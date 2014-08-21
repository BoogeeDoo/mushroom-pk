var BaseScene = require("../baseScene");
var util = require("util");
var nameGenerator = require("chinese-random-name");

/**
 * connect scene
 *
 * @constructor
 * @param {String} id scene id
 */
var ConnectScene = function(id, autoDel) {
    BaseScene.call(this, id, autoDel);

    this.percent = 0;
};

util.inherits(ConnectScene, BaseScene);

/**
 * update the fake progress bar
 *
 * @param {Number} delta
 * @param {Function} callback
 */
ConnectScene.prototype.update = function(delta, callback) {
    if(this.percent > 70) return callback();

    var add = delta / 100;
    if(this.percent > 20) add /= 2;
    if(this.percent > 50) add /= 2;
    this.percent += add;
    console.log(this.percent)
    if(this.percent > 70) this.percent = 70;

    callback();
};

/**
 * render the fake progress bar
 *
 * @param {Number} delta
 * @param {Function} callback
 */
ConnectScene.prototype.render = function(delta, callback) {
    this.renderer.clearCanvas();

    this.renderer.moveTo(2, 2);

    var width = this.canvas.width;
    var height = this.canvas.height;

    var processBar = {
        width   : width - 8,
        height  : 2,

        left    : 4,
        top     : (height - 2) / 2
    };

    var self = this;
    var percent = this.percent / 100;
    this.renderer.fillStyle = "white";
    this.renderer.fillRect(processBar.left, processBar.top, processBar.width, processBar.height);
    this.renderer.strokeStyle = "green";
    this.renderer.strokeRect(
        processBar.left,
        processBar.top,
        processBar.width * percent, 1);

    percent = "Connecting to server: " + (percent * 100).format(2) + "%...";
    var length = percent.length;

    this.renderer.resetState();
    this.renderer.fillStyle = "red";
    this.renderer.fillText(percent, (width - length) / 2, 3 + (height - 1) / 2);

    callback();
};

module.exports = ConnectScene;


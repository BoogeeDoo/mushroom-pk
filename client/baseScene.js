var util = require("util");
var EventEmitter = require("events").EventEmitter;
var Canvas = require("term-canvas");
var CanvasCtx = require("term-canvas/lib/context2d");
CanvasCtx.prototype.clearCanvas = function() {
    this.clearRect(0, 0, this.canvas.width, this.canvas.height);
};

/**
 * base scene
 *
 * @constructor
 * @param {String} id
 * @Param {Boolean} autoDel
 */
var BaseScene = function(id, autoDel) {
    EventEmitter.call(this);

    this.id = id;
    this.autoDel = autoDel;

    // term canvas
    var _size = process.stdout.getWindowSize();
    this.renewCanvas(_size[0], _size[1]);

    this.socket = global.socket;
};

util.inherits(BaseScene, EventEmitter);

/**
 * init
 *
 * @param {Function} callback
 */
BaseScene.prototype.init = function(callback) {
    callback();
};

/**
 * update
 *
 * @param {Number} deltaTime
 * @param {Function} callback
 */
BaseScene.prototype.update = function(deltaTime, callback) {
    callback();
};

/**
 * render
 *
 * @param {Number} deltaTime
 * @param {Function} callback
 */
BaseScene.prototype.render = function(deltaTime, callback) {
    callback();
};

/**
 * renew canvas
 *
 * @param {Number} width
 * @param {Number} height
 */
BaseScene.prototype.renewCanvas = function(width, height) {
    this.canvas = undefined;
    this.renderer = undefined;

    this.canvas = new Canvas(width, height);
    this.renderer = this.canvas.getContext("2d");
    this.renderer.hideCursor();
};

module.exports = BaseScene;


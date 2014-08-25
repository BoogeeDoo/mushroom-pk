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

    this.first = true;

    this.name = "";

    this.dotCount = 0;
    this.toUpdateDotTime = 0;

    this.status = "注册名字";

    this.on("register.ok", this.onNameRegistered.bind(this));
    this.on("register.error", this.onNameDuplicated.bind(this));
    this.on("room.created", this.onRoomCreated.bind(this));
};

util.inherits(StartScene, BaseScene);

StartScene.prototype.onRoomCreated = function(players) {
    global.sceneManager.createScene("room", "room");
    global.sceneManager.getSceneById("room").init(players, function(err) {
        global.sceneManager.setCurrentScene("room");
    });
};

/**
 * onNameRegistered
 */
StartScene.prototype.onNameRegistered = function() {
    this.status = "等待队列";

    global.name = this.name;
};

StartScene.prototype.onNameDuplicated = function() {
    this.status = "重名了，重新注册名字";
    this.name = nameGenerator.generate();
    this.socket.emit("register", this.name);
};

/**
 * init
 *
 * @param {Function} callback
 */
StartScene.prototype.init = function(callback) {
    callback();
};

/**
 * update
 *
 * @param {Number} delta
 * @param {Function} callback
 */
StartScene.prototype.update = function(delta, callback) {
    if(this.first) {
        this.first = false;

        // 起一个霸气的名字
        this.name = nameGenerator.generate();

        // 发送给服务端
        this.socket.emit("register", this.name);
    }

    this.toUpdateDotTime += delta;
    if(this.toUpdateDotTime > 500) {
        this.toUpdateDotTime = 0;
        this.dotCount = (this.dotCount + 1) % 4;
    }

    callback();
};

StartScene.prototype.render = function(delta, callback) {
    var fpsDisplay = this.fps.format(2) + " FPS";
    this.renderer.clearCanvas();

    this.renderer.fillStyle = "red";
    this.renderer.fillText("FPS: " + this.fps.format(2), 5, 2);

    var height = this.canvas.height;

    this.renderer.fillStyle = "red";
    this.renderer.fillText("【" + this.name + "】", 5, parseInt(height / 2));

    var display = this.status;
    for(var i = 0; i < this.dotCount; i++) display += ".";
    this.renderer.fillStyle = "green";
    this.renderer.fillText(display, 5, parseInt(height / 2) + 1);

    callback();
};

module.exports = StartScene;


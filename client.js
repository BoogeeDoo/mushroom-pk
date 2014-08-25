require("sugar");
require("./lib/common");
var config = require("./config");
var botter = require("socket.io-client")("http://" + config.server.bind_ip + ":" + config.server.port);

var sceneManager = require("./client/sceneManager");
global.sceneManager = sceneManager;
global.socket = botter;

sceneManager.createScene("connect", "connect");
sceneManager.setCurrentScene("connect");
sceneManager.start();

botter.on("connect", function() {
    sceneManager.sendEvent("connected");
    require("./client/socketEvent");
});


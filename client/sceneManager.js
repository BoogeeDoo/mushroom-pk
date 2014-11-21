var moment = require("moment");

var currentScene = null;
var scenes = {};
var running = false;

/**
 * get current scene
 *
 * @return {Scene}
 */
exports.getCurrentScene = function() {
    return currentScene;
};

/**
 * get scene by id
 *
 * @param {String} id
 * @return {Scene}
 */
exports.getSceneById = function(id) {
    return scenes[id];
};

/**
 * set current scene
 *
 * @param {String} id
 * @return {Boolean}
 */
exports.setCurrentScene = function(id) {
    if(currentScene && currentScene.id === id) return true;
    var scene = scenes[id];
    if(undefined === scene) return false;

    if(currentScene && currentScene.autoDel) {
        scenes[currentScene.id] = undefined;
        currentScene = null;
    }

    currentScene = scene;
    return true;
};

/**
 * create a scene
 *
 * @param {String} id
 * @param {String} sceneName
 * @param {Boolean} autoDel
 * @return {Boolean}
 */
exports.createScene = function(id, sceneName, autoDel) {
    if(scenes[id]) {
        return false;
    }

    var Scene, scene;
    try {
        Scene = require("./scenes/" + sceneName + "Scene");
        scene = new Scene(id, autoDel === undefined ? true : autoDel);
    } catch(e) {
        return false;
    }

    scenes[id] = scene;

    return true;
};

exports.currentTime = 0;
exports.previousTime = 0;
exports._fps = 60;
exports.fps = 0;
var _next = function() {
    process.nextTick(exports._frameFunc.bind(exports));
};

/**
 * send event
 */
exports.sendEvent = function() {
    if(currentScene) {
        currentScene.emit.apply(currentScene, arguments);
    }
};

exports.sendEventToCertainScene = function(sceneName) {
    var name = sceneName;
    var newArgu = Array.prototype.slice.call(arguments);
    newArgu.shift();

    var scene = scenes[name];
    if(scene) {
        scene.emit.apply(scene, newArgu);
    }
};

/**
 * frame function
 */
exports._frameFunc = function() {
    exports.previousTime = exports.currentTime === 0 ? moment() : exports.currentTime;
    exports.currentTime = moment();

    var delta = exports.currentTime - exports.previousTime;
    exports.fps = 1 / (delta / 1000);

    if(currentScene) {
        var id = currentScene.id;
        currentScene.fps = exports.fps;

        var _windowSize = process.stdout.getWindowSize();
        if(_windowSize[0] !== currentScene.canvas.width || _windowSize[1] !== currentScene.canvas.height) {
            for(var key in scenes) {
                if(scenes[key]) scenes[key].renewCanvas(_windowSize[0], _windowSize[1]);
            }
        }

        return currentScene.update(delta, function() {
            var now = moment();
            var needWait = 1.0 / exports._fps;
            needWait *= 1000;
            needWait = parseInt(needWait);
            needWait -= (now - exports.currentTime);
            if(needWait < 0) needWait = 0;

            // if scene was deleted
            if(!currentScene) return setTimeout(_next, needWait);
            
            // if scene not been switched
            if(currentScene.id === id) {
                return currentScene.render(delta, function() {
                    var now = moment();
                    var needWait = 1.0 / exports._fps;
                    needWait *= 1000;
                    needWait = parseInt(needWait);
                    needWait -= (now - exports.currentTime);
                    if(needWait < 0) needWait = 0;
                    setTimeout(_next, needWait);
                });
            }

            // scene switched
            setTimeout(_next, needWait);
        });
    }

    // if no scene, start next frame immediatly
    _next();
};

/**
 * start game loop
 */
exports.start = function() {
    if(running) return;
    console.log("PK client started.");
    _next();
    running = true;
};


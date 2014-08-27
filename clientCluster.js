var cluster = require("cluster");

if(cluster.isMaster) {
    var opts = require("nomnom").option("child-process-count", {
        abbr: "c",
        help: "Children process count it will start up.",
        default: 9
    }).parse();

    for (var i = 0; i < opts["child-process-count"]; i++) {
        cluster.fork();
    }

    cluster.on("listening", function(worker, address) {
        console.log("Bot listening: worker " + worker.procss.pid + ", Address: " + address.address + ":" + address.port)
    });

    cluster.on("exit", function(worker, code, signal) {
        console.log("worker " + worker.process.pid + " died");
    });
} else {
    require("./client");
}

var conf = require("config").get("conf"),
    argv = require('optimist').argv,
    async = require("async"),
    log4js = require('log4js'),
    pgClient = require("./components/pgClient"),
    processorsHeap = require("./processors/index"),

    lastBuildInfo = {};

    log4js.configure(conf.log4js);

var log = log4js.getLogger("main"),
    logFlow = log4js.getLogger("flow");


logFlow.info(argv);

pgClient.init().fail(function() {

    log.error("Failed to initialize PostgreSQL connection");
    process.exit(-1);

}).done(function(info) {

    lastBuildInfo = info;

    logFlow.info("Going to initialize processors...");

    // now, init the processors which needs to be initialized
    processorsHeap.initAllProcessors().done(function(){

        // ok great, everything is done, let's proceed
        logFlow.info("Processors have been initialized, so let's continue");

        if (argv.job) {
            logFlow.info("Job name received, run import for: " + argv.job);
            jobFlow(argv.job, argv.build_id, finish);
        } else {
            logFlow.info("Start checking CI jobs...");
        }
    });
});



function finish(err, res) {
    err && log.error(err, res);
    logFlow.info("Finish");

    logFlow.info("All done.");
    process.exit();
}

function jobFlow(jobName, build_id, callback) {
    log.debug("Flow start");
    async.auto({
        saveJobInDb: saveJobInDb(jobName),
        saveBuildInDb: ["saveJobInDb", saveBuildInDb(build_id)],
        processReports: ["saveJobInDb", "saveBuildInDb", processReports]
    }, function(err, res) {
        callback(err, res)
    });
}

function saveJobInDb (jobName) {
    return function (callback) {
        var job = {
            name: jobName
        };

        log.debug("saveJobInDb. Job:", jobName);

        pgClient.saveJob(job, function(err, job_id) {
            job.id = job_id;
            callback(err, job);
        });
    }
}



function saveBuildInDb (build_id) {
    return function (callback, results) {
        var job = results.saveJobInDb,
            build = {
                id: build_id
            };

        if (!job || !build || build.building) {
            return callback();
        }

        log.debug("saveBuildInDb. Job:", job.name, " Build:", build.number);

        pgClient.saveBuild(job, build).fail(function () {

        }).done(function (build_id) {
            lastBuildInfo[job.name] = build.number;
            build.build_id = build_id;

            callback(null, build);
        });
    }
}

function processReports(callback, results) {

    var job = results.saveJobInDb,
        build = results.saveBuildInDb,
        stack = [];

    if (!job || !build || (build.result !== "SUCCESS")) {
        return callback();
    }

    log.debug("processReports. Job:", job.name, " Build:", build.number);

    var processors = processorsHeap.getAllProcessors();

    Object.keys(processors).forEach(function(type) {
        if (processors[type].run) {
            stack.push(async.apply(processors[type].run, job, build));
        }
    });

    async.parallel(stack, callback);
}
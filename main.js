var conf = require("config").get("conf"),
    yargs = require('yargs')
        .usage('CLI arguments:')
        .options({
            'job': {
                describe: 'text (module-jrs-ui-pro-trunk-jade-new-css-html)'
            },
            'build': {
                describe: 'number (35)'
            },
            'started': {
                describe: 'timestamp (1447938126624)'
            },
            'started-by': {
                describe: 'text (user name)'
            },
            'result': {
                describe: 'text (SUCCESS UNSTABLE FAILURE)'
            },
            'change-set': {
                describe: 'text (some text)'
            },
            'coverage-report-path': {
                describe: 'path to coverage report'
            },
            'time-report-path': {
                describe: 'path to time report'
            },
            'size-report-path': {
                describe: 'path to size report'
            }
        })
        .help('help')
        .alias('h', 'help')
        .demand(['job','build', 'started', 'started-by', 'result', 'change-set', 'coverage-report-path', 'time-report-path', 'size-report-path'])
        .argv,
    async = require("async"),
    log4js = require('log4js'),
    pgClient = require("./components/pgClient"),
    processorsHeap = require("./processors/index"),

    lastBuildInfo = {};

    log4js.configure(conf.log4js);

var log = log4js.getLogger("main"),
    logFlow = log4js.getLogger("flow");

if(yargs.help || yargs.h) {
    return
}

logFlow.info(yargs);

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

        if (yargs.job) {
            logFlow.info("Job name received, run import for: " + yargs.job);
            jobFlow(yargs.job, yargs.build, yargs.started, yargs["started-by"], yargs.result, yargs["change-set"], finish);
        } else {
            logFlow.info("Please run with arguments");
        }
    });
});



function finish(err, res) {
    err && log.error(err, res);
    logFlow.info("Finish");

    logFlow.info("All done.");
    process.exit();
}

function jobFlow(jobName, build_id, started, started_by,result, change_set, callback) {
    log.debug("Flow start");
    async.auto({
        saveJobInDb: saveJobInDb(jobName),
        saveBuildInDb: ["saveJobInDb", saveBuildInDb(build_id, started, started_by, result, change_set)],
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

        pgClient.saveJob(job.name, function(err, job_id) {
            job.id = job_id;
            callback(err, job);
        });
    }
}



function saveBuildInDb (build_id, started, started_by, result, change_set) {
    return function (callback, results) {
        var job = results.saveJobInDb,
            build = {
                id: build_id,
                number: build_id,
                timestamp:  started,
                startedBy:  started_by,
                result: result,
                changeSet: change_set
            };

        if (!job || !build) {
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
    var reportPath = {
        coverage: yargs["coverage-report-path"],
        time: yargs["time-report-path"],
        size: yargs["size-report-path"]
    };

    Object.keys(processors).forEach(function(type) {
        if (processors[type].run) {
            stack.push(async.apply(processors[type].run, job, build, reportPath[type]));
        }
    });

    async.parallel(stack, callback);
}
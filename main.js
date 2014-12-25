var conf = require("config").get("conf"),
    async = require("async"),
    log4js = require('log4js'),
    jenkins = require("./components/jenkins"),
    pgClient = require("./components/pgClient"),
    processorsHeap = require("./processors/index"),
    lastBuildInfo = {};

log4js.configure(conf.log4js);
var log = log4js.getLogger("main"),
    logFlow = log4js.getLogger("flow");


pgClient.init().fail(function() {

    log.error("Failed to initialize PostgreSQL connection");
    process.exit(-1);

}).done(function(info) {

    lastBuildInfo = info;
    logFlow.info("Last build info: ", lastBuildInfo);

    logFlow.info("Going to initialize processors...");

    // now, init the processors which needs to be initialized
    processorsHeap.initAllProcessors().done(function(){

        // ok great, everything is done, let's proceed
        logFlow.info("Processors have been initialized, so let's continue");

        logFlow.info("Start checking CI jobs...");

        checkCIJobs();

    });
});

function checkCIJobs() {
    
    // get full job list
    logFlow.info("Getting full list of jobs...");

    jenkins.get(null, null).fail(function(reason) {

        log.error("Failed to get list of jobs on CI. Reason is: ", reason);

        // maybe it was a temporary error ? let's make another request later
        logFlow.info("Sleeping for " + (parseInt(conf.interval) / 1000) + " seconds before next circle of checking...");
        setTimeout(checkCIJobs, conf.interval);

    }).done(function(res) {

        var stack = [],
            jobs = res.jobs;

        log.debug("Jobs found on CI:", jobs);

        if (!jobs || !jobs.length) {
            logFlow.info("Job list empty");
            return finish(null, "");
        }

        // build the list of jobs
        jobs.forEach(function(job) {

            logFlow.debug("Building task list for job ", job.name);

            // ignore some jobs which are not faf modules
            if (conf.jenkins.ignore.indexOf(job.name) > -1) {
                return;
            }
            stack.push(async.apply(jobFlow, job));
        });

        // run them in parallel
        async.parallel(stack, finish);
    });
}

function finish(err, res) {
    err && log.error(err);
    logFlow.info("Finish");

    logFlow.info("All done, sleeping for " + (parseInt(conf.interval) / 1000) + " seconds before next circle of checking...");
    setTimeout(checkCIJobs, conf.interval);
}

function jobFlow(job, callback) {
    log.debug("Flow start");
    async.auto({
        getJobInfo: getJobInfo(job.name),
        getLastBuildInfo: ["getJobInfo", getLastBuildInfo],
        saveJobInDb: ["getJobInfo", saveJobInDb],
        saveBuildInDb: ["saveJobInDb", "getLastBuildInfo", saveBuildInDb],
        processReports: ["saveJobInDb", "getLastBuildInfo", "saveBuildInDb", processReports]
    }, function(err, res) {
        callback(err, res)
    });
}

function getJobInfo(jobName) {
    return function(callback) {

        log.debug("getJobInfo. Job:", jobName);

        jenkins.get(jobName, null).fail(function(reason) {
            callback(true, reason);
        }).done(function(job) {
            if (!job.lastBuild) {
                job.empty = true;
            } else if (job.lastBuild.number <= lastBuildInfo[job.name]) {
                job.skipped = true;
            }
            callback(false, job);
        });
    };
}

function getLastBuildInfo(callback, results) {
    var job = results.getJobInfo;
    if (job.empty || job.skipped) {
        return callback();
    }

    log.debug("getLastBuildInfo. Job:", job.name, " Build:", job.lastBuild.number);

    jenkins.get(job.name, job.lastBuild.number).fail(function(reason){
        callback(true, reason);
    }).done(function(build){
        callback(false, build);
    });
}

function saveJobInDb(callback, results) {
    var job = results.getJobInfo;
    if (!job || job.empty || job.skipped) {
        return callback();
    }

    log.debug("saveJobInDb. Job:", job.name);

    pgClient.saveJob(job, function(err, job_id) {
        job.id = job_id;
        callback(err, job);
    });
}

function saveBuildInDb(callback, results) {
    var job = results.saveJobInDb,
        build = results.getLastBuildInfo;

    if (!job || !build || job.empty || job.skipped || build.building) {
        return callback();
    }

    log.debug("saveBuildInDb. Job:", job.name, " Build:", build.number);

    pgClient.saveBuild(job, build).fail(function() {

    }).done(function(build_id) {
        lastBuildInfo[job.name] = build.number;
        build.build_id = build_id;

        callback(null, build);
    });
}

function processReports(callback, results) {

    var job = results.saveJobInDb,
        build = results.saveBuildInDb,
        stack = [];

    if (!job || !build || job.empty || job.skipped || build.building) {
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

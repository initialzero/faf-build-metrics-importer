var conf = require("config").get("conf"),
    async = require("async"),
    log4js = require('log4js'),
    jenkins = require("./components/jenkins"),
    pg = require("./components/pg"),
    processors = require("./processors/index"),
    lastBuildInfo = {};

log4js.configure(conf.log4js);
var log = log4js.getLogger("fbmi"),
    logFlow = log4js.getLogger("flow");


pg.init(function(err, info) {
    lastBuildInfo = info;
    check();
    setInterval(function() {
        check();
    }, conf.interval);
});

function check() {
    logFlow.info("Start checking");
    // get full job list
    jenkins.get(null, null, function(err, res) {
        var stack = [],
            jobs = res.jobs;

        logFlow.debug("Jobs:", jobs);

        if (!jobs.length) {
            logFlow.info("Job list empty");
            return finish(null, "");
        }

        jobs.forEach(function(job) {
            // ignore some jobs that not faf modules
            if (conf.jenkins.ignore.indexOf(job.name) > -1) {
                return;
            }

            stack.push(async.apply(flow, job));
        });

        async.parallel(stack, finish);

    });
}
function finish(err, res) {
    err && logFlow.error(err);
    logFlow.info("Finish");
}

function flow(job, callback) {
    logFlow.debug("Flow start");
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
        logFlow.debug("getJobInfo. Job:", jobName);
        jenkins.get(jobName, null, function(err, job) {
            if (!job.lastBuild) {
                job.empty = true;
            } else if (job.lastBuild.number <= lastBuildInfo[job.name]) {
                job.skipped = true;
            }
            callback(err, job);
        });
    };
}
function getLastBuildInfo(callback, results) {
    var job = results.getJobInfo;
    if (job.empty || job.skipped) {
        return callback();
    }

    logFlow.debug("getLastBuildInfo. Job:", job.name, " Build:", job.lastBuild.number);

    jenkins.get(job.name, job.lastBuild.number, function(err, build) {
        callback(err, build);
    });
}
function saveJobInDb(callback, results) {
    var job = results.getJobInfo;
    if (!job || job.empty || job.skipped) {
        return callback();
    }

    logFlow.debug("saveJobInDb. Job:", job.name);

    pg.saveJob(job, function(err, job_id) {
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

    logFlow.debug("saveBuildInDb. Job:", job.name, " Build:", build.number);

    pg.saveBuild(job, build, function(err) {
        lastBuildInfo[job.name] = build.number;
        callback(err);
    });
}
function processReports(callback, results) {
    var job = results.saveJobInDb,
        build = results.getLastBuildInfo,
        stack = [];

    if (!job || !build || job.empty || job.skipped || build.building) {
        return callback();
    }


    Object.keys(processors).forEach(function(type) {
        if (processors[type]) {
            stack.push(async.apply(processors[type], job, build));
        }
    });
    async.parallel(stack, callback);

}
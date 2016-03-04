var conf = require("config").get("conf"),
    log4js = require('log4js'),
    xml2js = require("xml2js"),
    request = require("request"),
    Deferred = require("Deferred"),
    fs = require("fs"),
    pgClient = require("../components/pgClient");

var procLog = log4js.getLogger("coverageProcessor"),
    logFlow = log4js.getLogger("flow");

function getStatisticFromXML(xmlData) {

    var dfr = new Deferred();

    (new xml2js.Parser()).parseString(xmlData, function (err, result) {

        var myStat = {};
        var globalStat = result["coverage"]["$"];

        myStat.functionsCovered = 0;
        myStat.branchesCovered = parseFloat(globalStat["branch-rate"]);
        myStat.linesCovered = parseFloat(globalStat["line-rate"]);

        var totalMethods = 0;
        var totalHittedMethods = 0;
        var totalLines = 0;
        var totalHittedLines = 0;

        var packages = result["coverage"]["packages"][0]["package"];
        // here packages is <packages> tag
        // loop thr all packages...
        packages.forEach(function(pkg) {
            // here pkg is <package> tag

            // get 'classes' object and loop thr each class inside classes tag
            pkg["classes"].forEach(function(cls) {
                // here we are inside one class

                if (typeof cls["class"][0]["methods"][0] !== "string") {
                    // take "methods" and go thr them
                    var methods = cls["class"][0]["methods"][0]["method"];
                    totalMethods = totalMethods + methods.length;
                    methods.forEach(function (mth) {
                        if (mth["$"]["hits"] !== "0") {
                            totalHittedMethods++;
                        }
                    });
                }

                if (typeof cls["class"][0]["lines"][0] !== "string") {
                    // take "lines" and go thr them
                    var lines = cls["class"][0]["lines"][0]["line"];
                    totalLines = totalLines + lines.length;
                    lines.forEach(function (line) {
                        if (line["$"]["hits"] !== "0") {
                            totalHittedLines++;
                        }
                    });
                }
            });
        });

        //procLog.info("Methods: ", totalHittedMethods, "of", totalMethods, ", rate is: ", totalHittedMethods / totalMethods);
        //procLog.info("Lines: ", totalHittedLines, "of", totalLines, ", rate is: ", totalHittedLines / totalLines);

        myStat.functionsCovered = totalHittedMethods / totalMethods;
        myStat.linesCovered = totalHittedLines / totalLines;

        dfr.resolve(myStat);
    });

    return dfr;
}

function getCoverageXMLFile(job, reportPath) {
    var dfr = new Deferred();

    if(fs.existsSync(reportPath)) {
        fs.readFile(reportPath, "ascii", function (error, body) {
            if (!error) {
                dfr.resolve(body);
                return;
            } else {
                procLog.warn("Failed to get data for job: ", job.name);
                dfr.reject("Failed to load XML file from a job. " + error);
            }
        });
    } else {
        logFlow.warn("File Coverage report not exists");
    }

    return dfr;
}

module.exports = {

    run: function (job, build, reportPath, callback) {

        procLog.debug("Checking job: ", job.name);

        getCoverageXMLFile(job, reportPath, build).done(function (xmlCoverageFileContent) {

            procLog.debug("Got XMl file from buildmater for job ", job.name);

            getStatisticFromXML(xmlCoverageFileContent).done(function (statistic) {

                procLog.debug("Got coverage statistic from XML file: ", statistic, " (job name is: ", job.name, "), saving it ...");

                pgClient.saveCoverageData(job, build, statistic, callback);

            }).fail(function(err){
                procLog.error("Failed to get coverage statistic from XML file, (job name is: ", job.name, ")");
                callback(err);
            });
        }).fail(function (reason) {
            procLog.warn("Failed to get XML for job ", job.name, ". Reason: ", reason);
            callback(null, reason);
        });

    }
};

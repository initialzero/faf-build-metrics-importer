var conf = require("config").get("conf"),
    log4js = require('log4js'),
    xml2js = require("xml2js"),
    request = require("request"),
    Deferred = require("Deferred"),
    pgClient = require("../components/pgClient");

log4js.configure(conf.log4js);
var logFlow = log4js.getLogger("flow");

function buildJenkinsUrl(job, path) {

    var url = "http://";

    if (conf.jenkins["usr"]) {
        url = url + conf.jenkins["usr"];
        if (conf.jenkins["pwd"]) {
            url = url + ":" + conf.jenkins["pwd"];
        }
        url = url + "@";
    }

    url = url + conf.jenkins["url"] + "/job/" + job + "/ws/" + path;

    return  url;
}

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

        //logFlow.info("Methods: ", totalHittedMethods, "of", totalMethods, ", rate is: ", totalHittedMethods / totalMethods);
        //logFlow.info("Lines: ", totalHittedLines, "of", totalLines, ", rate is: ", totalHittedLines / totalLines);

        myStat.functionsCovered = totalHittedMethods / totalMethods;
        myStat.linesCovered = totalHittedLines / totalLines;

        dfr.resolve(myStat);
    });

    return dfr;
}

function getCoverageXMLFile(job) {
    var dfr = new Deferred();

    var urlToQueryJenkins = buildJenkinsUrl(job.name, "test/karma-coverage/coverage/PhantomJS%201.9.8%20%28Linux%29/cobertura-coverage.xml");

    request(urlToQueryJenkins, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            dfr.resolve(body);
            return;
        }

        var reason = "unknown reason (http code is: " + response.statusCode + ")";
        if (response.statusCode == 404) {
            reason = "resource not found (404)";
        }

        dfr.reject("Failed to load XML file from a job. The reason is: " + reason);
    });

    return dfr;
}

module.exports = {

    init: function(doneCallbackFunc) {

        pgClient.doQuery("SELECT * FROM faf_metrics_build_coverage LIMIT 1", [], true).fail(function () {

            // There is no table which needed for this module, so let's create it...
            logFlow.info("Creating a table for 'faf_metrics_build_coverage' processor");

            var createTableSQL = "CREATE TABLE faf_metrics_build_coverage ("+
                "id integer NOT NULL," +
                "build_id integer NOT NULL," +
                "functionsCovered float," +
                "branchesCovered float," +
                "linesCovered float)";

            pgClient.doQuery(createTableSQL, []).fail(function () {

                logFlow.error("Failed to initialize module 'coverage': can't create table 'faf_metrics_build_coverage'");
                doneCallbackFunc();

            }).done(function(){

                var sql;

                // creating sequence
                sql = "CREATE SEQUENCE faf_metrics_build_coverage_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1";
                pgClient.doQuery(sql, []);

                // and attaching it to the table
                sql = "ALTER SEQUENCE faf_metrics_build_coverage_id_seq OWNED BY faf_metrics_build_coverage.id";
                pgClient.doQuery(sql, []);

                // setting initial value of the id value
                sql = "ALTER TABLE ONLY faf_metrics_build_coverage ALTER COLUMN id SET DEFAULT nextval('faf_metrics_build_coverage_id_seq'::regclass)";
                pgClient.doQuery(sql, []);

                // registering sequence
                sql = "SELECT pg_catalog.setval('faf_metrics_build_coverage_id_seq', 1, false)";
                pgClient.doQuery(sql, []);

                // adding primary key to the table
                sql = "ALTER TABLE ONLY faf_metrics_build_coverage ADD CONSTRAINT faf_metrics_build_coverage_pkey PRIMARY KEY (id)";
                pgClient.doQuery(sql, []);

                // adding foreign key to the table to allow cascade removing of data
                sql = "ALTER TABLE ONLY faf_metrics_build_coverage ADD CONSTRAINT faf_metrics_build_coverage_build_id_fkey FOREIGN KEY (build_id) REFERENCES faf_metrics_build(build_id)";
                pgClient.doQuery(sql, []);

                // even if we failed to add an index, it doesn't matter so much, I guess
                // and the error in log file will be enough

                doneCallbackFunc();
            });

        }).done(function(){
            doneCallbackFunc();
        });
    },

    run: function (job, build) {

        var dfr = new Deferred();

        logFlow.info("Coverage processor: checking job: ", job.displayName);

        getCoverageXMLFile(job, build).fail(function (reason) {
            logFlow.info("Coverage processor: failed to get XML for job ", job.displayName, ". Reason: ", reason);
            dfr.reject(reason);
        }).done(function (xmlCoverageFileContent) {

            logFlow.info("Coverage processor: Got XMl file from buildmater for job ", job.displayName);

            getStatisticFromXML(xmlCoverageFileContent).done(function (statistic) {

                logFlow.info("Coverage processor: got coverage statistic from XML file: ", statistic, " (job name is: ", job.displayName, "), saving it ...");

                var sql =
                    "INSERT INTO faf_metrics_build_coverage (" +
                        "id, " +
                        "build_id, " +
                        "functionsCovered, " +
                        "branchesCovered, " +
                        "linesCovered) " +
                    "VALUES ($1, $2, $3, $4, $5)";

                pgClient.doQuery(sql, [
                    job.id,
                    build.number,
                    statistic.functionsCovered,
                    statistic.branchesCovered,
                    statistic.linesCovered
                ]).done(function () {
                    logFlow.info("Coverage processor: saved coverage statistic for job ", job.displayName);
                    dfr.resolve(statistic);
                }).fail(function () {
                    logFlow.error("Coverage processor: failed to save coverage statistic for job ", job.displayName);
                    dfr.reject();
                });

            }).fail(function(){
                logFlow.error("Coverage processor: failed to get coverage statistic from XML file: ", statistic, " (job name is: ", job.displayName, ")");
                dfr.reject();
            });
        });

        return dfr;
    }
};

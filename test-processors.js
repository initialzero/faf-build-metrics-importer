/**
 * Created by valeriy.abornyev on 2/24/2016.
 */

var mock = require('mock-require'),
    timeData = require("./build/metrics/time"),
    sizeData = require("./build/metrics/size"),
    assert = require("assert");


mock('./components/pgClient', {
    saveTimeData: function(job, body, build, callback) {
        console.log('saveTimeData called');
        assert.equal(job, JobMock);
        assert.deepEqual(JSON.parse(body), timeData);
        assert.deepEqual(build, {});
    },
    saveSizeData: function(job, body, build, callback) {
        console.log('saveSizeData called');
        assert.equal(job, JobMock);
        assert.deepEqual(JSON.parse(body), sizeData);
        assert.deepEqual(build, {});
    },
    saveCoverageData: function(job, build, statistic, callback) {
        console.log('saveCoverageData called');
        assert.deepEqual(job, JobMock);
        assert.deepEqual(build, buildMoch);
        assert.deepEqual(statistic, statisticMock);
    }
});

var time = require('./processors/time');
var size = require('./processors/size');
var coverage = require('./processors/coverage');

var JobMock =  {name: 'ldfjhsdfbj', id: 17},
    buildMoch = {
        id: 35,
        number: 35,
        timestamp: 1447938126624,
        startedBy: 'user name',
        result: 'SUCCESS',
        changeSet: 'some text',
        build_id: 147
    },
    statisticMock =  {
        functionsCovered: 0.45121951219512196,
        branchesCovered: 0.3832,
        linesCovered: 0.34646739130434784
    };

var reportPath = {
    coverage: "./build/metrics/cobertura-coverage.xml",
    time: "./build/metrics/time.json",
    size: "./build/metrics/size.json"
};

time.run(JobMock, {}, reportPath.time, function() {});
size.run(JobMock, {}, reportPath.size, function() {});
coverage.run(JobMock, buildMoch, reportPath.coverage, function() {});

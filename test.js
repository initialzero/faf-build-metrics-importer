/**
 * Created by valeriy.abornyev on 1/29/2016.
 */


var time = require('./processors/time.js'),
    size = require('./processors/size.js'),
    coverage = require('./processors/coverage.js');

time.run({name: "test-time"}, {build_id: 1}, function(res, err) {
    console.log(res);
    console.log(err);
});

size.run({name: "test-size"}, {build_id: 2}, function(res, err) {
    console.log(res);
    console.log(err);
});

coverage.run({name: "test-coverage"}, {build_id: 3}, function(res, err) {
    console.log(res);
    console.log(err);
});
/**
 * Created by valeriy.abornyev on 1/29/2016.
 */


var time = require('./processors/time.js');
var size = require('./processors/size.js');

time.run({name: "test"}, {build_id: 1}, function(res, err) {
    console.log(res);
    console.log(err);
});

size.run({name: "test-size"}, {build_id: 2}, function(res, err) {
    console.log(res);
    console.log(err);
});
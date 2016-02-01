/**
 * Created by valeriy.abornyev on 1/29/2016.
 */


var time = require('./processors/time.js');

time.run({name: "test"}, {build_id: 1}, function(res, err) {
    console.log(res);
    console.log(err);
});
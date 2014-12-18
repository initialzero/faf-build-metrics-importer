# faf-build-metrics-importer
Tool for import, parse and put to DB FAF build data


### postres module
Uses [node-postgres](https://github.com/brianc/node-postgres/wiki/Client#paramaterized-query-with-optional-callback-supplied). Has few methods.

##### doQuery
```
pg.doQuery("SELECT * FROM table WHERE id=$1", [12], callback);
```
##### doQueryStack
```
var queryArray = [
    ["INSERT INTO table VALUES ($1)", [123]],
    ["INSERT INTO table VALUES ($1)", [456]]
];

pg.doQueryStack(queryArray, callback);
```

### How to add report
- put file to folder "processors" 
`processors/newReport.js`
- create function which get, process and save data to database

```
var pg = require("../components/pg"); // Use postres module.

module.exports = function(job, build, callback) {
    // do all staff
    
    var reportData = "some report data";
    
    pg.doQuery("INSERT INTO new_report_table VALUES ($1, $2, $3)", [job.id, build.number, reportData], callback)
}
```


### TODO
- redesign db
- refactor pg module, add getBuildId, getJobId
- log to file
- memory usage
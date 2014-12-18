# faf-build-metrics-importer
Tool for import, parse and put to DB FAF build data


### How to add report
- config/default.json

    reports: ["newReport"]

- processor

    put function which get, process and save data to database


### TODO
redesign db
refactor pg module, add getBuildId, getJobId
log to file
memory usage
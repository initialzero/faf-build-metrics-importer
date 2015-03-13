var argv = require("optimist").argv,
    file = argv.f || "faf-build-metrics-importer.log",
    port = argv.p || "8085",

    spawn = require('child_process').spawn,
    tail = spawn('tail', ["-f", file]),

    http = require('http'),

    io = require('socket.io'),
    fs = require('fs');


var app = http.createServer(function(req, res) {
    fs.readFile(__dirname + '/index.html', function (err, data) {
        if (err) {
            res.writeHead(500);
            return res.end('Error loading index.html');
        }

        data = data.toString().replace(/{{port}}/g, port);

        res.writeHead(200);
        res.end(data);
    });
});

io.listen(app).sockets.on('connection', function (socket) {

    tail.stdout.on("data", function (data) {
        socket.emit('log', data.toString("utf8"));
    });

});

app.listen(port);

console.log('listen %s on http://localhost:%s/', file, port);

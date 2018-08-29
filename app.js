var url = require('url');
var port = process.env.PORT || 3000;
//var VideoEditor = require(__dirname + '/video_editor.js');

//wake up http server
var http = require('http');
const WebSocket = require('ws');

//Enable to receive requests access to the specified port
var server = http.createServer();

var pathWebsockets = {}

server.on('upgrade', function upgrade(request, socket, head) {
  var pathname = url.parse(request.url).pathname;
  console.log(pathname);
  if(!pathWebsockets[pathname] || !pathWebsockets[pathname].server){
    var websocketServer = new WebSocket.Server({ noServer: true });
    var serverObject = {server: websocketServer, connections: []};
    websocketServer.on('connection', function connection(ws) {
      ws.on('close', function () {
        console.log('close');
        serverObject.connections = serverObject.connections.filter(function (conn, i) {
          return (conn === ws) ? false : true;
        });
      });
      serverObject.connections.push(ws);
    });
    websocketServer.handleUpgrade(request, socket, head, function done(ws) {
      websocketServer.emit('connection', ws, request);
    });
    pathWebsockets[pathname] = serverObject;
  }
});

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});;
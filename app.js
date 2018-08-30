var url = require('url');

var express = require('express');
var app = express();
app.use(express.static('public'));

var port = process.env.PORT || 3100;
//var VideoEditor = require(__dirname + '/video_editor.js');

//wake up http server
var http = require('http');
var WebSocket = require('ws');
var glob = require("glob");

var pathWebsockets = {}
var CONTROLLER_ROOT_PATH = "/ws_controllers"
var ws_controllers = glob.sync(__dirname + CONTROLLER_ROOT_PATH + "/**/*.js");
for(var i = 0;i < ws_controllers.length;++i){
  var controller_path = ws_controllers[i].match(new RegExp(CONTROLLER_ROOT_PATH + ".+")).toString();
  var action_path = controller_path.replace(new RegExp("^" + CONTROLLER_ROOT_PATH), "").toString();
  var key = action_path.replace(new RegExp(".js$"), "").toString();
  pathWebsockets[key] = require(ws_controllers[i]);
}

//Enable to receive requests access to the specified port
var server = http.createServer();

server.on('upgrade', function upgrade(request, socket, head) {
  var pathname = url.parse(request.url).pathname;
  if(pathname[pathname.length - 1] == "/"){
    pathname = pathname.substr(0, pathname.length - 2);
  }
  var controller = pathWebsockets[pathname];
  if(!controller || !controller.server){
    var websocketServer = new WebSocket.Server({noServer: true});
    var serverObject = {server: websocketServer, connections: []};
    websocketServer.on('connection', function connection(ws) {
      ws.on('message', function (message) {
        console.log('message:' + message);
        if(controller && controller.message){
          controller.message(websocketServer, ws, serverObject.connections, message);
        }
      });
      ws.on('close', function () {
        console.log('close');
        if(controller && controller.close){
          controller.close(websocketServer, ws, serverObject.connections);
        }
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
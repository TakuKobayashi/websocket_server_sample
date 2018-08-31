var url = require('url');

var express = require('express');
var app = express();
app.use(express.static('public'));

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

var routings = require(__dirname + "/config/routes.js");

var port = process.env.PORT || 3000;
//var VideoEditor = require(__dirname + '/video_editor.js');

//wake up http server
var http = require('http');
var WebSocket = require('ws');
var glob = require("glob");

var pathWebsockets = {}
var WS_CONTROLLER_ROOT_PATH = "/ws_controllers";
var ws_controllers = glob.sync(__dirname + WS_CONTROLLER_ROOT_PATH + "/**/*.js");
for(var i = 0;i < ws_controllers.length;++i){
  var controller_path = ws_controllers[i].match(new RegExp(WS_CONTROLLER_ROOT_PATH + ".+")).toString();
  var action_path = controller_path.replace(new RegExp("^" + WS_CONTROLLER_ROOT_PATH), "").toString();
  var key = action_path.replace(new RegExp(".js$"), "").toString();
  pathWebsockets[key] = require(ws_controllers[i]);
}

var pathHttps = {}
var CONTROLLER_ROOT_PATH = "/controllers";
var controllers = glob.sync(__dirname + CONTROLLER_ROOT_PATH + "/**/*.js");
for(var i = 0;i < controllers.length;++i){
  var controller_path = controllers[i].match(new RegExp(CONTROLLER_ROOT_PATH + ".+")).toString();
  var action_path = controller_path.replace(new RegExp("^" + CONTROLLER_ROOT_PATH), "").toString();
  var key = action_path.replace(new RegExp(".js$"), "").toString();
  pathHttps[key] = require(controllers[i]);
}

//Enable to receive requests access to the specified port
var server = http.createServer(app);

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
        if(pathname.length <= 0){
          serverObject.connections.forEach(function (con, i) {
            con.send(message);
          });
        }else if(controller && controller.message){
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
      console.log(serverObject.connections);
    });
    websocketServer.handleUpgrade(request, socket, head, function done(ws) {
      websocketServer.emit('connection', ws, request);
    });
    pathWebsockets[pathname] = serverObject;
  }
});

var pathes = Object.keys(routings);
for(var i = 0;i < pathes.length;++i){
  var actions = Object.keys(routings[pathes[i]]);
  var controller = pathHttps[pathes[i]];
  var routing = routings[pathes[i]];
  for(var j = 0;j < actions.length;++j){
    app[actions[i]](pathes[i], controller[routing[actions[i]]]);
  }
}

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});;
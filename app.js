var url = require('url');

var express = require('express');
var app = express();
app.use(express.static('public'));

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

var routings = require(__dirname + "/config/routes.js");

var port = process.env.PORT || 3000;

//wake up http server
var http = require('http');
var WebSocket = require('ws');
var glob = require("glob");

var pathWebsockets = {}
var WS_CONTROLLER_ROOT_PATH = "/ws_controllers";
var ws_controllers = glob.sync(__dirname + WS_CONTROLLER_ROOT_PATH + "/**/*.js");
for (var i = 0; i < ws_controllers.length; ++i) {
  var controller_path = ws_controllers[i].match(new RegExp(WS_CONTROLLER_ROOT_PATH + ".+")).toString();
  var action_path = controller_path.replace(new RegExp("^" + WS_CONTROLLER_ROOT_PATH), "").toString();
  var key = action_path.replace(new RegExp(".js$"), "").toString();
  pathWebsockets[key] = require(ws_controllers[i]);
}

var pathHttps = {}
var CONTROLLER_ROOT_PATH = "/controllers";
var controllers = glob.sync(__dirname + CONTROLLER_ROOT_PATH + "/**/*.js");
for (var i = 0; i < controllers.length; ++i) {
  var controller_path = controllers[i].match(new RegExp(CONTROLLER_ROOT_PATH + ".+")).toString();
  var action_path = controller_path.replace(new RegExp("^" + CONTROLLER_ROOT_PATH), "").toString();
  var key = action_path.replace(new RegExp(".js$"), "").toString();
  pathHttps[key] = require(controllers[i]);
}

//Enable to receive requests access to the specified port
var server = http.createServer(app);

var pathServerObjects = {}
server.on('upgrade', function upgrade(request, socket, head) {
  var pathname = url.parse(request.url).pathname;
  if (pathname[pathname.length - 1] == "/") {
    pathname = pathname.substr(0, pathname.length - 2);
  }
  var serverObject = pathServerObjects[pathname] || {};
  var controller = pathWebsockets[pathname];
  if (!serverObject || !serverObject.server) {
    serverObject = {
      server: new WebSocket.Server({
        noServer: true
      }),
      connections: []
    };
    serverObject.server.on('connection', function connection(ws) {
      ws.on('message', function (message) {
        console.log('message:' + message);
        if (pathname.length <= 0) {
          serverObject.connections.forEach(function (con, i) {
            con.send(message);
          });
        } else if (controller && controller.message) {
          controller.message(serverObject.server, ws, serverObject.connections, message);
        }
      });
      ws.on('close', function () {
        console.log('close');
        if (controller && controller.close) {
          controller.close(serverObject.server, ws, serverObject.connections);
        }
        serverObject.connections = serverObject.connections.filter(function (conn, i) {
          return (conn === ws) ? false : true;
        });
      });
      serverObject.connections.push(ws);
      pathServerObjects[pathname] = serverObject;
    });
  }
  serverObject.server.handleUpgrade(request, socket, head, function done(ws) {
    serverObject.server.emit('connection', ws, request);
  });
});

const pathes = Object.keys(routings);
for (const path of pathes) {
  const actions = Object.keys(routings[path]);
  const controller = pathHttps[path];
  const routing = routings[path];
  for (const action of actions) {
    app[action](path, controller[routing[action]]);
  }
}

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});;
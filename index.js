var express = require('express');
var app = express();

//サーバーの立ち上げ
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

app.get('/', function(req, res){
  //res.send('<h1>Hello world</h1>');
  res.sendFile(__dirname + '/index.html');
});

//サーバーと接続されると呼ばれる
io.on('connection', function(socket){
  console.log('a user connected');
  //接続している、人達(socket)がサーバーにメッセーッジを送った時にcallbackされるイベントを登録
  //第一引数はイベント名
  socket.on('grab', function(msg){
    //受け取った人以外でつながっている人全員に送る場合(broadcastを使う)
    //socket.broadcast.emit('message', 'hello');
    //受け取った人含めて全員に送る場合
    //位第一引数のイベント名に対して送る
    socket.broadcast.emit('grab', msg);
    console.log('grab: ' + msg);
  });

  //サーバーとの接続が遮断されると呼ばれる
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

//指定したポートにきたリクエストを受け取れるようにする
server.listen(port, function () {
  console.log('Server listening at port %d', port);
});
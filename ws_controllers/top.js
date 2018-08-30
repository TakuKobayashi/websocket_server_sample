module.exports = {
  message: function(wss, ws, connections, message){
    console.log('message:', message);
    connections.forEach(function (con, i) {
      con.send(message);
    });
  },
  close: function(wss, ws, connections){
    console.log('close');
    connections = connections.filter(function (conn, i) {
      return (conn === ws) ? false : true;
    });
  }
}
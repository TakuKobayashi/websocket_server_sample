module.exports = {
  message: function(wss, ws, connections, message){
    connections.forEach(function (con, i) {
      con.send(message);
    });
  },
  close: function(wss, ws, connections){
    connections = connections.filter(function (conn, i) {
      return (conn === ws) ? false : true;
    });
  }
}
var roomConnectionObj = {};

var filterByRoomId = function(roomId){
  var sameRoomObjs = []
  var wsArray = Object.keys(roomConnectionObj);
  for(var i = 0;i < wsArray.length;++i){
    if(roomConnectionObj[wsArray[i]].room_id == room_id){
      sameRooms.push({
        ws: wsArray[i],
        user_id: roomConnectionObj[wsArray[i]].user_id,
        room_id: roomConnectionObj[wsArray[i]].room_id,
        point: roomConnectionObj[wsArray[i]].point
      });
    }
  }
  return sameRoomObjs;
}

module.exports = {
  message: function(wss, ws, connections, message){
    var messageObj = {}
    try{
      messageObj = JSON.parse(message)
    }catch(e){
      return messageObj;
    }
    if(messageObj.action == "init"){
      roomConnectionObj[ws] = {
        room_id: messageObj.room_id,
        user_id: messageObj.user_id,
        point: 0,
      }
      var sameRoomObjs = filterByRoomId(messageObj.room_id);
      if(sameRoomObjs.lendth >= messageObj.member_count){
        for(var i = 0;i < sameRoomObjs.length;++i){
          var sendJson = {
            action: "start_count_down",
            point: roomConnectionObj[sameRoomObjs[i].ws].point,
            room_id: roomConnectionObj[sameRoomObjs[i].ws].room_id,
            user_ids: sameRoomObjs.map(obj => obj.user_id)
          }
          sameRoomObjs[i].ws.send(JSON.stringify(sendJson));
        }
      }
    }else if(messageObj.action == "contact"){
      var sameRoomObjs = filterByRoomId(messageObj.room_id);
      var myRoomObj = sameRoomObjs.find(obj => obj.user_id == messageObj.user_id);
      myRoomObj.point = myRoomObj.point + 100;
      roomConnectionObj[myRoomObj.ws].point = myRoomObj.point;
      for(var i = 0;i < sameRoomObjs.length;++i){
        var sendJson = {
          action: "appear_object",
          point: roomConnectionObj[sameRoomObjs[i].ws].point,
          room_id: roomConnectionObj[sameRoomObjs[i].ws].room_id,
          user_ids: sameRoomObjs.map(obj => obj.user_id)
        }
        sameRoomObjs[i].ws.send(JSON.stringify(sendJson));
      }
    }
  },
  close: function(wss, ws, connections){
    delete roomConnectionObj[ws];
  }
}
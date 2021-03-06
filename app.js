var http = require('http');
var express = require('express');
var socketio = require('socket.io');
var path = require('path');

var app = express();
var config = require('./config.json');
var gameConfig = require('./modules/public/gameConfig.json');
var util = require('./modules/public/util.js');

app.use(express.static(path.join(__dirname, 'public')));

var server = http.createServer(app);
var port = process.env.PORT || config.port;

server.listen(port, function(){
  console.log('Server is Running');
});

var GameManager = require('./modules/server/GameManager.js');
var GM = new GameManager();
GM.start();

var User = require('./modules/server/User.js');

var INTERVAL_TIMER = 1000/gameConfig.INTERVAL;

var io = socketio.listen(server);

GM.onUpdateUser = function(){
  var userDatas = GM.updateDataSettings();
  io.sockets.emit('updateUser', userDatas);
}
GM.onCreateVirus = function(viruses){
  var virusData = [];
  for(var i=0; i<viruses.length; i++){
    virusData.push(GM.updateVirusDataSetting(viruses[i]));
  }
  console.log(virusData);
  io.sockets.emit('createViruses', virusData);
};
GM.onDeleteVirus = function(virusID){
  io.sockets.emit('deleteVirus', virusID);
};
GM.onCreateFoods = function(foods){
  var foodsDatas = [];
  for(var i=0; i<foods.length; i++){
    foodsDatas.push(GM.updateFoodDataSetting(foods[i]));
  }
  io.sockets.emit('createFoods', foodsDatas);
};
GM.onDeleteFood = function(foodID){
  io.sockets.emit('deleteFood', foodID);
};
GM.onUserDestroy = function(userID){
  io.sockets.emit('userDestroy', userID);
}
io.on('connection', function(socket){
  console.log('user connect : ' + socket.id);

  var user = new User(socket.id);
  var updateUserInterval = false;

  socket.on('reqStartGame', function(userName){
    if(util.checkNameIsValid(userName)){
      // user init and join game
      GM.initializeUser(user, userName);
      GM.joinUser(user);

      //update user data
      if(!updateUserInterval){
        updateUserInterval = setInterval(function(){ GM.updateUser(user); }, INTERVAL_TIMER);
      }

      var userData = GM.updateDataSetting(user);
      //send users user joined game
      socket.broadcast.emit('userJoined', userData);

      var userDatas = GM.updateDataSettings();
      var foodsDatas = GM.updateFoodsDataSettings();
      var virusesDatas = GM.updateVirusesDataSettings();
      console.log(userDatas);

      socket.emit('setSyncUser', userData);
      socket.emit('resStartGame', userDatas, foodsDatas, virusesDatas);
    }else{
      socket.emit('rename');
      socket.disconnect();
    }
  });

  socket.on('reqMove', function(targetPosition){
    // var newTargetPosition = util.localToWorldPosition(targetPosition, localOffset);
    GM.setUserTargetAndMove(user, targetPosition);

    var data = GM.updateDataSetting(user);
  });

  socket.on('reqSkill', function(){
    GM.fireClone(user);
  });
  socket.on('disconnect', function(){
    if(user.constructor === User){
      GM.stopUser(user);
      GM.kickUser(user);
      io.sockets.emit('userLeave', user.objectID);
      user = null;
    }
    if(updateUserInterval){
      clearInterval(updateUserInterval);
      updateUserInterval = false;
    }
    console.log('user disconnect :' + socket.id);
  });
});

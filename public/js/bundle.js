(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var User = require('./CUser.js');
var util = require('../public/util.js');

var CManager = function(){
	//all users
	this.users = [];
	this.foods = [];
	this.viruses = [];
};

CManager.prototype = {
	setUser : function(userData){
		if(!(userData.objectID in this.users)){
			var tempUser = new User(userData, this.gameConfig);
			this.users[userData.objectID] = tempUser;
		}else{
			console.log('user.objectID duplicated. something is wrong.');
		}
	},
	setUsers : function(userDatas){
		for(var index in userDatas){
			var tempUser = new User(userDatas[index]);
			this.users[userDatas[index].objectID] = tempUser;
		}
	},
	setFoods : function(foodsDatas){
		for(var i =0; i<Object.keys(foodsDatas).length; i++){
			this.foods.push(foodsDatas[i]);
		}
	},
	setViruses : function(virusesDatas){
		for(var i=0; i<virusesDatas.length; i++){
			this.viruses.push(virusesDatas[i]);
		}
	},
	createViruses : function(virusesDatas){
		for(var i=0; i<virusesDatas.length; i++){
			this.viruses.push(virusesDatas[i]);
		}
	},
	deleteVirus : function(virusID){
		for(var i=0; i<this.viruses.length; i++){
			if(virusID === this.viruses[i].objectID){
				this.viruses.splice(i, 1);
			}
		}
	},
	createFoods : function(foodsDatas){
		for(var i =0; i<Object.keys(foodsDatas).length; i++){
			this.foods.push(foodsDatas[i]);
		}
	},
	deleteFood : function(foodID){
		for(var i=0; i<Object.keys(this.foods).length; i++){
			if(this.foods[i].objectID === foodID){
				this.foods.splice(i, 1);
				return;
			}
		}
	},
	kickUser : function(objID){
		if(!(objID in this.users)){
			console.log('user already out');
		}else{
			delete this.users[objID];
		}
	},
	deleteUser : function(userID){
		if(userID in this.users){
			delete this.users[userID];
		}else{
			console.log('user already deleted');
		}
	},
	updateUsers : function(userDatas){
		for(var i=0; i<userDatas.length; i++){
			this.updateUserData(userDatas[i]);
		}
	},
	updateUserData : function(userData){
		this.users[userData.objectID].position = userData.position;
		this.users[userData.objectID].size = userData.size;
		this.users[userData.objectID].clones = [];
		for(var i=0; i<Object.keys(userData.clones).length; i++){
			this.users[userData.objectID].clones.push({
				objectID : userData.clones[i].objectID,
				position : userData.clones[i].position,
				size : userData.clones[i].size
			});
		}
	}
};

module.exports = CManager;

},{"../public/util.js":5,"./CUser.js":2}],2:[function(require,module,exports){
var User = function(userData){
  this.objectID = userData.objectID;
  this.position = userData.position;
  this.size = userData.size;
  this.clones = [];
}

module.exports = User;

},{}],3:[function(require,module,exports){
module.exports={
  "INTERVAL" : 30,

  "CANVAS_MAX_SIZE" : {"width" : 3200 , "height" : 3200},
  "CANVAS_MAX_LOCAL_SIZE" : {"width" : 1600, "height" : 1000},

  "OBJECT_STATE_IDLE" : 0,
  "OBJECT_STATE_MOVE" : 1,

  "FPS" : 60,
  "PLUS_SIZE_WIDTH" : 500,
  "PLUS_SIZE_HEIGHT" : 500,

  "GAME_STATE_LOAD" : 0,
  "GAME_STATE_START_SCENE" : 1,
  "GAME_STATE_GAME_START" : 2,
  "GAME_STATE_GAME_ON" : 3,
  "GAME_STATE_GAME_END" : 4,

  "SIGHT_FACTOR" : 100,
  "MAX_SIGHT" : 5
}

},{}],4:[function(require,module,exports){
module.exports={
  "VIRUS_SRC" : "../images/virus.png"
}

},{}],5:[function(require,module,exports){
var gameConfig = require('./gameConfig.json');

//must use with bind or call method
exports.rotate = function(){
  // console.log(this);
  if(this.targetDirection === this.direction){
    if(this.currentState === gameConfig.OBJECT_STATE_MOVE){
      this.move();
    }else if(this.currentState === gameConfig.OBJECT_STATE_MOVE_OFFSET){
        //only use at client
        this.moveOffset();
    }
  }
  //check rotate direction
  else if(this.direction > 0 && this.targetDirection < 0){
    if((180 - this.direction + 180 + this.targetDirection) < (this.direction - this.targetDirection)){
      if(Math.abs(this.targetDirection - this.direction)<this.rotateSpeed){
        this.direction += Math.abs(this.targetDirection - this.direction);
      }else{
        this.direction += this.rotateSpeed;
      }
    }else if(this.targetDirection < this.direction){
      if(Math.abs(this.targetDirection - this.direction)<this.rotateSpeed){
        this.direction -= Math.abs(this.targetDirection - this.direction);
      }else{
        this.direction -= this.rotateSpeed;
      }
    }
  }else if(this.direction < 0 && this.targetDirection >0 ){
    if((180 + this.direction + 180 - this.targetDirection) < (this.targetDirection - this.direction)){
      if(Math.abs(this.targetDirection - this.direction)<this.rotateSpeed){
        this.direction -= Math.abs(this.targetDirection - this.direction);
      }else{
        this.direction -= this.rotateSpeed;
      }
    }else if(this.targetDirection > this.direction){
      if(Math.abs(this.targetDirection - this.direction)<this.rotateSpeed){
        this.direction += Math.abs(this.targetDirection - this.direction);
      }else{
        this.direction += this.rotateSpeed;
      }
    }
  }else if(this.targetDirection > this.direction){
    if(Math.abs(this.targetDirection - this.direction)<this.rotateSpeed){
      this.direction += Math.abs(this.targetDirection - this.direction);
    }else{
      this.direction += this.rotateSpeed;
    }
  }else if(this.targetDirection < this.direction){
    if(Math.abs(this.targetDirection - this.direction)<this.rotateSpeed){
      this.direction -= Math.abs(this.targetDirection - this.direction);
    }else{
      this.direction -= this.rotateSpeed;
    }
  }

  if(this.direction >= 180){
    this.direction -= 360;
  }else if(this.direction <= -180){
    this.direction += 360;
  }
};

//must use with bind or call method
exports.move = function(addPos){
  if(this.targetPosition.x < this.size.width/2){
    this.targetPosition.x = this.size.width/2;
  }else if(this.targetPosition.x > gameConfig.CANVAS_MAX_SIZE.width + this.size.width/2){
    this.targetPosition.x = gameConfig.CANVAS_MAX_SIZE.width + this.size.width/2;
  }
  if(this.targetPosition.y < this.size.height/2){
    this.targetPosition.y = this.size.height/2;
  }else if(this.targetPosition.y > gameConfig.CANVAS_MAX_SIZE.height + this.size.height/2){
    this.targetPosition.y = gameConfig.CANVAS_MAX_SIZE.height + this.size.height/2;
  }
  //calculate dist with target
  var distX = this.targetPosition.x - this.center.x;
  var distY = this.targetPosition.y - this.center.y;

  if(distX == 0 && distY == 0){
    this.stop();
    this.changeState(gameConfig.OBJECT_STATE_IDLE);
  }
  if(Math.abs(distX) < Math.abs(this.speed.x)){
    this.speed.x = distX;
  }
  if(Math.abs(distY) < Math.abs(this.speed.y)){
    this.speed.y = distY;
  }
  this.position.x += this.speed.x;
  this.position.y += this.speed.y;

  this.setCenter();

  if(addPos && addPos.x && addPos.y){
    this.position.x += addPos.x;
    this.position.y += addPos.y;

    this.center.x += addPos.x;
    this.center.y += addPos.y;
  }
  if(this.center.x < this.size.width/2){
    this.center.x = this.size.width/2;
  }else if(this.center.x > gameConfig.CANVAS_MAX_SIZE.width + this.size.width/2){
    this.center.x = gameConfig.CANVAS_MAX_SIZE.width + this.size.width/2;
  }
  if(this.center.y < this.size.height/2){
    this.center.y = this.size.height/2;
  }else if(this.center.y > gameConfig.CANVAS_MAX_SIZE.height + this.size.height/2){
    this.center.y = gameConfig.CANVAS_MAX_SIZE.height + this.size.height/2;
  }
};

//must use with bind or call method
//setup when click canvas for move
exports.setSpeed = function(){
  var distX = this.targetPosition.x - this.center.x;
  var distY = this.targetPosition.y - this.center.y;

  if(distX == 0  && distY ==0){
    this.speed.x = 0;
    this.speed.y = 0;
  }else if(Math.pow(distX,2) + Math.pow(distY,2) < 100){
    this.speed.x = distX;
    this.speed.y = distY;
  }else{
    this.speed.x = (distX>=0?1:-1)*Math.sqrt(Math.pow(this.maxSpeed,2)*Math.pow(distX,2)/(Math.pow(distX,2)+Math.pow(distY,2)));
    this.speed.y = (distY>=0?1:-1)*Math.sqrt(Math.pow(this.maxSpeed,2)*Math.pow(distY,2)/(Math.pow(distX,2)+Math.pow(distY,2)));
  }
};

//must use with bind or call method
// setup when click canvas for move or fire skill
exports.setTargetDirection = function(){
  var distX = this.targetPosition.x - this.center.x;
  var distY = this.targetPosition.y - this.center.y;

  var tangentDegree = Math.atan(distY/distX) * 180 / Math.PI;
  if(distX < 0 && distY >= 0){
    this.targetDirection = tangentDegree + 180;
  }else if(distX < 0 && distY < 0){
    this.targetDirection = tangentDegree - 180;
  }else{
    this.targetDirection = tangentDegree;
  }
};

//check obstacle collision
exports.checkCircleCollision = function(tree, posX, posY, radius, id){
  var returnVal = [];
  var obj = {x : posX, y: posY, width:radius * 2, height: radius * 2, id: id};
  tree.onCollision(obj, function(item){
    if(obj.id !== item.id){
      var objCenterX = obj.x + obj.width/2;
      var objCenterY = obj.y + obj.height/2;

      var itemCenterX = item.x + item.width/2;
      var itemCenterY = item.y + item.height/2;

      // check sum of radius with item`s distance
      var distSquareDiff = Math.pow(obj.width/2 + item.width/2,2) - Math.pow(itemCenterX - objCenterX,2) - Math.pow(itemCenterY - objCenterY,2);
      if(distSquareDiff > 0 ){
        //collision occured
        returnVal.push(item);
      }
    }
  });
  return returnVal;
};

//coordinate transform
exports.localToWorldPosition = function(position, offset){
  var newPosition = {
    x : position.x + offset.x,
    y : position.y + offset.y
  };
  return newPosition;
};
exports.worldToLocalPosition = function(position, offset){
  var newPosition = {
    x : position.x - offset.x,
    y : position.y - offset.y
  };
  return newPosition;
};
exports.worldXCoordToLocalX = function(x, offsetX){
  return x - offsetX;
};
exports.worldYCoordToLocalY = function(y, offsetY){
  return y - offsetY;
};
exports.isDrawX = function(x, gameConfig){
  if(x <= gameConfig.userOffset.x - gameConfig.PLUS_SIZE_WIDTH){
    return false;
  }else if(x >= gameConfig.userOffset.x + gameConfig.canvasSize.width + gameConfig.PLUS_SIZE_WIDTH){
    return false;
  }else{
    return true;
  }
};
exports.isDrawY = function(y, gameConfig){
  if(y <= gameConfig.userOffset.y - gameConfig.PLUS_SIZE_HEIGHT){
    return false;
  }else if(y >= gameConfig.userOffset.y + gameConfig.canvasSize.height + gameConfig.PLUS_SIZE_HEIGHT){
    return false;
  }else{
    return true;
  }
};
exports.calculateOffset = function(user, canvasSize){
  var newOffset = {
    x : user.position.x + user.size.width/2 - canvasSize.width/2,
    y : user.position.y + user.size.height/2 - canvasSize.height/2
  };
  return newOffset;
};
exports.isExistsClone = function(userClones, updateClone){
  for(var i=0; i<userClones.length; i++){
    if(userClones[i].objectID === updateClone.objectID){
      return true;
    }
  }
  return false;
}
exports.isXInCanvas = function(x, gameConfig){
  var scaledX = x * gameConfig.scaleFactor;
  if(scaledX>0 && scaledX<gameConfig.canvasSize.width){
    return true;
  }
  return false;
};
exports.isYInCanvas = function(y, gameConfig){
  var scaledY = y * gameConfig.scaleFactor;
  if(scaledY>0 && scaledY<gameConfig.canvasSize.height){
    return true;
  }
  return false;
};

},{"./gameConfig.json":3}],6:[function(require,module,exports){
// inner Modules
var util = require('../../modules/public/util.js');
var User = require('../../modules/client/CUser.js');
var CManager = require('../../modules/client/CManager.js');
var gameConfig = require('../../modules/public/gameConfig.json');

var socket;

// document elements
var infoScene, gameScene, standingScene;
var startButton;

var canvas, ctx, scaleFactor;

// const var
var radianFactor = Math.PI/180;
var fps = 1000/60;

// game var
var Manager;

// resource var
var resource;
var imgVirus;

var userImage, userHand;
var grid;

// game state var
var gameState = gameConfig.GAME_STATE_LOAD;
var gameSetupFunc = load;
var gameUpdateFunc = null;

var drawInterval = null;

//state changer
function changeState(newState){
  clearInterval(drawInterval);
  drawInterval = null;
  switch (newState) {
    case gameConfig.GAME_STATE_LOAD:
      gameState = newState;
      gameSetupFunc = load;
      gameUpdateFunc = null;
      break;
    case gameConfig.GAME_STATE_START_SCENE:
      gameState = newState;
      gameSetupFunc = null
      gameUpdateFunc = standby;
      break;
    case gameConfig.GAME_STATE_GAME_START:
      gameState = newState;
      gameSetupFunc = start;
      gameUpdateFunc = null;
      break;
    case gameConfig.GAME_STATE_GAME_ON:
      gameState = newState;
      gameSetupFunc = null
      gameUpdateFunc = game;
      break;
    case gameConfig.GAME_STATE_END:
      gameSate = newState;
      gameSetupFunc = null;
      gameUpdateFunc = end;
      break;
  }
  update();
};
function update(){
  if(gameSetupFunc === null && gameUpdateFunc !== null){
    drawInterval = setInterval(gameUpdateFunc,fps);
  }else if(gameSetupFunc !==null && gameUpdateFunc === null){
    gameSetupFunc();
  }
}

//load resource, base setting
function load(){
  setBaseSetting();
  setCanvasSize();
  //event handle config
  startButton.onclick = function(){
    changeState(gameConfig.GAME_STATE_GAME_START);
  };
  window.onresize = function(){
    setCanvasSize();
  };
  changeState(gameConfig.GAME_STATE_START_SCENE);
};
//when all resource loaded. just draw start scene
function standby(){
  drawStartScene();
};
//if start button clicked, setting game before start game
//setup socket here!!! now changestates in socket response functions
function start(){
  setupSocket();
  socket.emit('reqStartGame');
};
//game play on
function game(){
  drawGame();
};
//show end message and restart button
function end(){
  changeState(gameConfig.GAME_STATE_START_SCENE);
};

//functions
function setBaseSetting(){
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');

  infoScene = document.getElementById('infoScene');
  gameScene = document.getElementById('gameScene');
  standingScene = document.getElementById('standingScene');
  startButton = document.getElementById('startButton');

  // inner Modules
  util = require('../../modules/public/util.js');
  User = require('../../modules/client/CUser.js');
  CManager = require('../../modules/client/CManager.js');
  gameConfig = require('../../modules/public/gameConfig.json');

  Manager = new CManager(gameConfig);

  // resource 관련
  resource = require('../../modules/public/resource.json');
  imgVirus = new Image();
  imgVirus.src = resource.VIRUS_SRC;
};
function setCanvasSize(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  gameConfig.canvasSize = {width : window.innerWidth, height : window.innerHeight};
  setSight();
  setCanvasScale();
};
function setSight(){
  if(Manager.users[gameConfig.userID]){
    var posLeft = Manager.users[gameConfig.userID].position.x;
    var posRight = Manager.users[gameConfig.userID].position.x + Manager.users[gameConfig.userID].size.width;
    var posTop = Manager.users[gameConfig.userID].position.y;
    var posBottom = Manager.users[gameConfig.userID].position.y + Manager.users[gameConfig.userID].size.height;

    for(var i=0; i<Manager.users[gameConfig.userID].clones.length; i++){
      if(posLeft > Manager.users[gameConfig.userID].clones[i].position.x){
        posLeft = Manager.users[gameConfig.userID].clones[i].position.x;
      }
      if(posRight < Manager.users[gameConfig.userID].clones[i].position.x + Manager.users[gameConfig.userID].clones[i].size.width){
        posRight = Manager.users[gameConfig.userID].clones[i].position.x + Manager.users[gameConfig.userID].clones[i].size.width;
      }
      if(posTop > Manager.users[gameConfig.userID].clones[i].position.y){
        posTop = Manager.users[gameConfig.userID].clones[i].position.y;
      }
      if(posBottom < Manager.users[gameConfig.userID].clones[i].position.y + Manager.users[gameConfig.userID].clones[i].size.height){
        posBottom = Manager.users[gameConfig.userID].clones[i].position.y + Manager.users[gameConfig.userID].clones[i].size.height;
      }
    }

    var diffWidth = posRight - posLeft;
    var diffHeight = posBottom - posTop;
    if(diffWidth > diffHeight){
      var diff = diffWidth;
    }else{
      diff = diffHeight;
    }
    gameConfig.sight = Math.round(diff / gameConfig.SIGHT_FACTOR * 100) / 100 > 10 ? gameConfig.MAX_SIGHT : Math.round(diff / gameConfig.SIGHT_FACTOR * 100) / 100;
  }else{
    gameConfig.sight = 1;
  }
};
function setCanvasScale(){
  var scaleX = 1;
  var scaleY = 1;
  if(gameConfig.canvasSize.width >= gameConfig.CANVAS_MAX_LOCAL_SIZE.width){
    scaleX =  (gameConfig.canvasSize.width / gameConfig.CANVAS_MAX_LOCAL_SIZE.width);
  }
  if(gameConfig.canvasSize.height >= gameConfig.CANVAS_MAX_LOCAL_SIZE.height){
    scaleY = (gameConfig.canvasSize.height / gameConfig.CANVAS_MAX_LOCAL_SIZE.height);
  }
  if(gameConfig.scaleX > gameConfig.scaleY){
    gameConfig.scaleFactor = scaleX / gameConfig.sight;
  }else{
    gameConfig.scaleFactor = scaleY / gameConfig.sight;
  }
};
function drawStartScene(){
  infoScene.classList.add('enable');
  infoScene.classList.remove('disable');
  gameScene.classList.add('disable');
  gameScene.classList.remove('enable');
  standingScene.classList.add('disable');
  standingScene.classList.remove('enable');
};

function drawGame(){
  infoScene.classList.add('disable');
  infoScene.classList.remove('enable');
  gameScene.classList.add('enable');
  gameScene.classList.remove('disable');
  standingScene.classList.add('disable');
  standingScene.classList.remove('enable');

  setSight();
  setCanvasScale();

  gameConfig.userOffset = calcOffset();
  if(gameConfig.userOffset){
    drawScreen();
    drawGrid();
    drawBackground();
    drawFoods();
    drawViruses();
    drawUser();
  }
};
// socket connect and server response configs
function setupSocket(){
  socket = io();
  socket.on('setSyncUser', function(user){
    gameConfig.userID = user.objectID;
  });
  //change state game on
  socket.on('resStartGame', function(userDatas, foodsDatas, virusesDatas){
    Manager.setUsers(userDatas);
    Manager.setFoods(foodsDatas);
    Manager.setViruses(virusesDatas);
    console.log(Manager.users);

    canvasAddEvent();
    documentAddEvent();

    changeState(gameConfig.GAME_STATE_GAME_ON);
  });
  socket.on('userJoined', function(data){
    Manager.setUser(data);
  });
  socket.on('createViruses', function(virusesData){
    Manager.createViruses(virusesData);
  });
  socket.on('deleteVirus', function(virusID){
    Manager.deleteVirus(virusID);
  });
  socket.on('createFoods', function(foodsDatas){
    Manager.createFoods(foodsDatas);
  });
  socket.on('deleteFood', function(foodID){
    Manager.deleteFood(foodID);
  });
  socket.on('updateUser', function(userDatas){
    Manager.updateUsers(userDatas);
  });
  socket.on('userDestroy', function(userID){
    if(userID === gameConfig.userID){
      changeState(gameConfig.GAME_STATE_END);
    }
    Manager.deleteUser(userID);
  })
  socket.on('userLeave', function(objID){
    Manager.kickUser(objID);
  });
};

//draw
function drawScreen(){
  //draw background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
};

function drawUser(){
  for(var index in Manager.users){

    ctx.beginPath();
    ctx.fillStyle = '#aaaaaa';
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 5;

    var centerX = util.worldXCoordToLocalX(Manager.users[index].position.x + Manager.users[index].size.width/2, gameConfig.userOffset.x);
    var centerY = util.worldYCoordToLocalY(Manager.users[index].position.y + Manager.users[index].size.height/2, gameConfig.userOffset.y);

    ctx.arc(centerX * gameConfig.scaleFactor, centerY * gameConfig.scaleFactor, Manager.users[index].size.width/2 * gameConfig.scaleFactor, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fill();
    ctx.closePath();

    //draw clones
    for(var i=0; i<Manager.users[index].clones.length; i++){
      ctx.beginPath();
      ctx.fillStyle = '#aaaaaa';
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 5;

      centerX = util.worldXCoordToLocalX(Manager.users[index].clones[i].position.x + Manager.users[index].clones[i].size.width/2, gameConfig.userOffset.x);
      centerY = util.worldYCoordToLocalY(Manager.users[index].clones[i].position.y + Manager.users[index].clones[i].size.height/2, gameConfig.userOffset.y);

      ctx.arc(centerX * gameConfig.scaleFactor, centerY * gameConfig.scaleFactor, Manager.users[index].clones[i].size.width/2 * gameConfig.scaleFactor, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fill();
      ctx.closePath();
    }
  }
};
function drawViruses(){
  for(var i=0; i<Manager.viruses.length; i++){
    // if(Manager.viruses[i].position.x > -gameConfig.PLUS_SIZE_WIDTH && Manager.viruses[i].position.x < canvas.width + gameConfig.PLUS_SIZE_WIDTH
    //     && Manager.viruses[i].position.y > -gameConfig.PLUS_SIZE_HEIGHT && Manager.viruses[i].position.y < canvas.height + gameConfig.PLUS_SIZE_HEIGHT){
    //   // ctx.beginPath();
      // ctx.fillStyle = '#ff00ff';
      var posX = util.worldXCoordToLocalX(Manager.viruses[i].position.x, gameConfig.userOffset.x);
      var posY = util.worldYCoordToLocalY(Manager.viruses[i].position.y, gameConfig.userOffset.y);

      // var centerX = util.worldXCoordToLocalX(Manager.viruses[i].position.x + Manager.viruses[i].size.width/2, gameConfig.userOffset.x);
      // var centerY = util.worldYCoordToLocalY(Manager.viruses[i].position.y + Manager.viruses[i].size.height/2, gameConfig.userOffset.y);
      ctx.drawImage(imgVirus, posX * gameConfig.scaleFactor, posY * gameConfig.scaleFactor, Manager.viruses[i].size.width/2 * gameConfig.scaleFactor, Manager.viruses[i].size.height/2 * gameConfig.scaleFactor);
      // ctx.arc(centerX * gameConfig.scaleFactor, centerY * gameConfig.scaleFactor, Manager.viruses[i].size.width/2 * gameConfig.scaleFactor, 0, Math.PI * 2);
      // ctx.fill();
      // ctx.closePath();
    // }
  }
};
function drawFoods(){
  for(var i=0; i<Manager.foods.length; i++){
    // if(Manager.foods[i].position.x > -gameConfig.PLUS_SIZE_WIDTH && Manager.foods[i].position.x < canvas.width + gameConfig.PLUS_SIZE_WIDTH
    //     && Manager.foods[i].position.y > -gameConfig.PLUS_SIZE_HEIGHT && Manager.foods[i].position.y < canvas.height + gameConfig.PLUS_SIZE_HEIGHT){
    ctx.beginPath();
    ctx.fillStyle = Manager.foods[i].color;
    var centerX = util.worldXCoordToLocalX(Manager.foods[i].position.x + Manager.foods[i].size.width/2, gameConfig.userOffset.x);
    var centerY = util.worldYCoordToLocalY(Manager.foods[i].position.y + Manager.foods[i].size.height/2, gameConfig.userOffset.y);
    ctx.arc(centerX * gameConfig.scaleFactor, centerY * gameConfig.scaleFactor, Manager.foods[i].size.width/2 * gameConfig.scaleFactor, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }
};
function drawBackground(){
  ctx.fillStyle = "#11ff11";
  ctx.globalAlpha = 0.8;
  var posX = -gameConfig.userOffset.x * gameConfig.scaleFactor;
  var posY = -gameConfig.userOffset.y * gameConfig.scaleFactor;
  var sizeW = gameConfig.CANVAS_MAX_SIZE.width * gameConfig.scaleFactor;
  var sizeH = gameConfig.CANVAS_MAX_SIZE.height * gameConfig.scaleFactor;
  ctx.fillRect(posX, posY, sizeW, sizeH);
  ctx.globalAlpha = 1;
};
function drawGrid(){
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#0000ff';
  ctx.globalAlpha = 0.15;
  ctx.beginPath();

  for(var x = - gameConfig.userOffset.x - gameConfig.canvasSize.width/gameConfig.scaleFactor; x<=gameConfig.CANVAS_MAX_SIZE.width/gameConfig.scaleFactor; x += gameConfig.CANVAS_MAX_LOCAL_SIZE.width/32){
    if(util.isXInCanvas(x, gameConfig)){
      ctx.moveTo(x * gameConfig.scaleFactor, 0);
      ctx.lineTo(x * gameConfig.scaleFactor, gameConfig.canvasSize.height);
    }
  };

  for(var y = - gameConfig.userOffset.y - gameConfig.canvasSize.height/gameConfig.scaleFactor; y<=gameConfig.CANVAS_MAX_SIZE.height/gameConfig.scaleFactor; y += gameConfig.CANVAS_MAX_LOCAL_SIZE.height/20){
    if(util.isYInCanvas(y, gameConfig)){
      ctx.moveTo(0, y * gameConfig.scaleFactor);
      ctx.lineTo(gameConfig.canvasSize.width, y * gameConfig.scaleFactor);
    }
  };

  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.closePath();
};
function canvasAddEvent(){
  canvas.addEventListener('click', function(e){
    var targetPosition ={
      x : e.clientX / gameConfig.scaleFactor,
      y : e.clientY / gameConfig.scaleFactor
    }
    var worldTargetPosition = util.localToWorldPosition(targetPosition, gameConfig.userOffset);
    socket.emit('reqMove', worldTargetPosition);
  }, false);
};
function documentAddEvent(){
  document.addEventListener('keydown', function(e){
    var keyCode = e.keyCode;
    if(keyCode === 32){
      socket.emit('reqSkill');
    }
  }, false);
};
function calcOffset(){
  var userCenterX = Manager.users[gameConfig.userID].position.x + Manager.users[gameConfig.userID].size.width * gameConfig.scaleFactor/2;
  var userCenterY = Manager.users[gameConfig.userID].position.y + Manager.users[gameConfig.userID].size.height * gameConfig.scaleFactor/2;
  var clonesCenterX = 0;
  var clonesCenterY = 0;
  var cloneCount = Manager.users[gameConfig.userID].clones.length;
  for(var i=0; i<cloneCount; i++){
    clonesCenterX += Manager.users[gameConfig.userID].clones[i].position.x + Manager.users[gameConfig.userID].clones[i].size.width * gameConfig.scaleFactor/2;
    clonesCenterY += Manager.users[gameConfig.userID].clones[i].position.y + Manager.users[gameConfig.userID].clones[i].size.height * gameConfig.scaleFactor/2;
  }

  var centerX = (userCenterX + clonesCenterX) / (cloneCount + 1);
  var centerY = (userCenterY + clonesCenterY) / (cloneCount + 1);

  return {
    x : centerX - gameConfig.canvasSize.width/(2 * gameConfig.scaleFactor),
    y : centerY - gameConfig.canvasSize.height/(2 * gameConfig.scaleFactor)
  };
  // return {
  //   x : Manager.users[gameConfig.userID].position.x + (Manager.users[gameConfig.userID].size.width * gameConfig.scaleFactor)/2 - gameConfig.canvasSize.width/(2 * gameConfig.scaleFactor),
  //   y : Manager.users[gameConfig.userID].position.y + (Manager.users[gameConfig.userID].size.height * gameConfig.scaleFactor)/2- gameConfig.canvasSize.height/(2 * gameConfig.scaleFactor)
  // };
};
update();

},{"../../modules/client/CManager.js":1,"../../modules/client/CUser.js":2,"../../modules/public/gameConfig.json":3,"../../modules/public/resource.json":4,"../../modules/public/util.js":5}]},{},[6]);

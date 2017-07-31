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

  userImage = new Image();
  grid = new Image();
  userImage.src = resource.USER_BODY_SRC;
  grid.src = resource.GRID_SRC;
};

function setCanvasSize(){

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  if(gameConfig.userOffset){
    var oldOffsetX = gameConfig.userOffset.x;
    var oldOffsetY = gameConfig.userOffset.y;
  }

  gameConfig.canvasSize = {width : window.innerWidth, height : window.innerHeight};
  gameConfig.scaleFactor = setCanvasScale(gameConfig.canvasSize, gameConfig.CANVAS_MAX_LOCAL_SIZE);

  if(gameConfig.userOffset){
    var worldPosUser = {
      position : util.localToWorldPosition(Manager.user.position,gameConfig.userOffset),
      size : Manager.user.size
    };
    gameConfig.userOffset = util.calculateOffset(worldPosUser, gameConfig.canvasSize);

    var revisionX = oldOffsetX - gameConfig.userOffset.x;
    var revisionY = oldOffsetY - gameConfig.userOffset.y;

    Manager.revisionAllObj(revisionX, revisionY);
  }
};
function setCanvasScale(windowSize, canvasMaxLocalSize){
  var scaleFactor = 1;
  if(windowSize.width >= canvasMaxLocalSize.width || windowSize.height >= canvasMaxLocalSize.height){
    var scaleFactor = (windowSize.width / canvasMaxLocalSize.width) > (windowSize.height / canvasMaxLocalSize.height) ?
                  (windowSize.width / canvasMaxLocalSize.width) : (windowSize.height / canvasMaxLocalSize.height);
  }
  return scaleFactor;
}
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

  drawScreen();
  drawGrid();
  drawFoods();
  drawUser();
};
// socket connect and server response configs
function setupSocket(){
  socket = io();

  //change state game on
  socket.on('resStartGame', function(userDatas, foodsDatas){
    Manager.setUsers(userDatas);
    Manager.setFoods(foodsDatas);
    Manager.synchronizeUser(gameConfig.userID);

    console.log(Manager.users);

    canvasAddEvent();
    documentAddEvent();

    changeState(gameConfig.GAME_STATE_GAME_ON);
  });
  socket.on('setSyncUser', function(user){
    gameConfig.userID = user.objectID;
    gameConfig.userOffset = util.calculateOffset(user, gameConfig.canvasSize);
    // Manager = new CManager(gameConfig);
  });

  socket.on('userJoined', function(data){
    Manager.setUser(data);

    console.log(Manager.users);
  });

  socket.on('resMove', function(userData){
    var startTime = Date.now();
    if(userData.objectID === gameConfig.userID){
      revisionUserPos(userData);
    }
    Manager.updateUserData(userData);
    Manager.moveUser(userData);
  });

  socket.on('createFoods', function(foodsDatas){
    Manager.createFoods(foodsDatas);
  });
  socket.on('deleteFoodAndAddUserMass', function(foodID, userID, userRadius){
    Manager.deleteFood(foodID);
    Manager.updateRadius(userID, userRadius);
  });

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
    var radian = Manager.users[index].direction * radianFactor;

    ctx.beginPath();
    ctx.fillStyle = '#aaaaaa';
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 5;
    ctx.arc(Manager.users[index].center.x, Manager.users[index].center.y, Manager.users[index].size.width/2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fill();
    ctx.closePath();

    // ctx.save();
    // ctx.setTransform(1,0,0,1,0,0);
    // ctx.translate(Manager.users[index].center.x, Manager.users[index].center.y);
    // ctx.rotate(radian);
    // ctx.drawImage(userImage, 0, 0, 128, 128,-Manager.users[index].size.width/2 * gameConfig.scaleFactor, -Manager.users[index].size.height/2 * gameConfig.scaleFactor, Manager.users[index].size.width * gameConfig.scaleFactor, Manager.users[index].size.width * gameConfig.scaleFactor);
    //
    // ctx.restore();
  }
};
function drawFoods(){
  for(var i=0; i<Object.keys(Manager.foods).length; i++){
    if(Manager.foods[i].position.x > -gameConfig.PLUS_SIZE_WIDTH && Manager.foods[i].position.x < canvas.width + gameConfig.PLUS_SIZE_WIDTH
      && Manager.foods[i].position.y > -gameConfig.PLUS_SIZE_HEIGHT && Manager.foods[i].position.y < canvas.height + gameConfig.PLUS_SIZE_HEIGHT){
        ctx.beginPath();
        ctx.fillStyle = Manager.foods[i].color;
        var centerX = Manager.foods[i].position.x + Manager.foods[i].size.width/2;
        var centerY = Manager.foods[i].position.y + Manager.foods[i].size.height/2;
        ctx.arc(centerX, centerY, Manager.foods[i].size.width/2, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
      }
  }
};
function drawGrid(){
  //draw boundary

  //draw grid
  for(var i=0; i<gameConfig.CANVAS_MAX_SIZE.width * gameConfig.scaleFactor; i += resource.GRID_SIZE * gameConfig.scaleFactor){
    if(util.isDrawX(i * gameConfig.scaleFactor, gameConfig)){
      var x = util.worldXCoordToLocalX(i * gameConfig.scaleFactor, gameConfig.userOffset.x);
      for(var j=0; j<gameConfig.CANVAS_MAX_SIZE.height * gameConfig.scaleFactor; j += resource.GRID_SIZE * gameConfig.scaleFactor){
        if(util.isDrawY(j * gameConfig.scaleFactor, gameConfig)){
          var y = util.worldYCoordToLocalY(j * gameConfig.scaleFactor, gameConfig.userOffset.y);
          ctx.drawImage(grid, 0, 0, 48, 48, x, y, resource.GRID_IMG_SIZE * gameConfig.scaleFactor, resource.GRID_IMG_SIZE * gameConfig.scaleFactor);
        }
      }
    }
  }
};
function canvasAddEvent(){
  canvas.addEventListener('click', function(e){
    var targetPosition ={
      x : e.clientX,
      y : e.clientY
    }
    var worldTargetPosition = util.localToWorldPosition(targetPosition, gameConfig.userOffset);
    socket.emit('reqMove', worldTargetPosition);
  }, false);
};
function documentAddEvent(){
  document.addEventListener('keydown', function(e){
    var keyCode = e.keyCode;
    var tempPos = util.localToWorldPosition({x : 0, y : 0}, gameConfig.userOffset);
    if(keyCode === 32){
      socket.emit('reqSkill');
  }, false);
};
function revisionUserPos(userData){
  var oldOffsetX = gameConfig.userOffset.x;
  var oldOffsetY = gameConfig.userOffset.y;

  gameConfig.userOffset = util.calculateOffset(userData, gameConfig.canvasSize);
  var revisionX = oldOffsetX - gameConfig.userOffset.x;
  var revisionY = oldOffsetY - gameConfig.userOffset.y;
  // Manager.revisionAllObj(revisionX, revisionY);
  Manager.revisionUserPos(revisionX, revisionY);
};
update();

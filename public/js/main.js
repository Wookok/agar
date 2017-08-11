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

  grid = new Image();
  grid.src = resource.GRID_SRC;
};
function setCanvasSize(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  gameConfig.canvasSize = {width : window.innerWidth, height : window.innerHeight};
  setCanvasScale(gameConfig);
};
function setCanvasScale(gameConfig){
  gameConfig.scaleX = 1;
  gameConfig.scaleY = 1;
  if(gameConfig.canvasSize.width >= gameConfig.CANVAS_MAX_LOCAL_SIZE.width){
    gameConfig.scaleX =  (gameConfig.canvasSize.width / gameConfig.CANVAS_MAX_LOCAL_SIZE.width);
  }
  if(gameConfig.canvasSize.height >= gameConfig.CANVAS_MAX_LOCAL_SIZE.height){
    gameConfig.scaleY = (gameConfig.canvasSize.height / gameConfig.CANVAS_MAX_LOCAL_SIZE.height);
  }
  if(gameConfig.scaleX > gameConfig.scaleY){
    gameConfig.scaleFactor = gameConfig.scaleX;
  }else{
    gameConfig.scaleFactor = gameConfig.scaleY;
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

    ctx.arc(centerX, centerY, Manager.users[index].size.width/2 * gameConfig.scaleFactor, 0, Math.PI * 2);
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

      ctx.arc(centerX, centerY, Manager.users[index].clones[i].size.width/2 * gameConfig.scaleFactor, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fill();
      ctx.closePath();
    }
  }
};
function drawViruses(){
  for(var i=0; i<Manager.viruses.length; i++){
    if(Manager.viruses[i].position.x > -gameConfig.PLUS_SIZE_WIDTH && Manager.viruses[i].position.x < canvas.width + gameConfig.PLUS_SIZE_WIDTH
        && Manager.viruses[i].position.y > -gameConfig.PLUS_SIZE_HEIGHT && Manager.viruses[i].position.y < canvas.height + gameConfig.PLUS_SIZE_HEIGHT){
      ctx.beginPath();
      ctx.fillStyle = '#ff00ff';
      var centerX = util.worldXCoordToLocalX(Manager.viruses[i].position.x + Manager.viruses[i].size.width/2, gameConfig.userOffset.x);
      var centerY = util.worldYCoordToLocalY(Manager.viruses[i].position.y + Manager.viruses[i].size.height/2, gameConfig.userOffset.y);
      ctx.arc(centerX, centerY, Manager.viruses[i].size.width/2 * gameConfig.scaleFactor, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
    }
  }
};
function drawFoods(){
  for(var i=0; i<Manager.foods.length; i++){
    if(Manager.foods[i].position.x > -gameConfig.PLUS_SIZE_WIDTH && Manager.foods[i].position.x < canvas.width + gameConfig.PLUS_SIZE_WIDTH
        && Manager.foods[i].position.y > -gameConfig.PLUS_SIZE_HEIGHT && Manager.foods[i].position.y < canvas.height + gameConfig.PLUS_SIZE_HEIGHT){
      ctx.beginPath();
      ctx.fillStyle = Manager.foods[i].color;
      var centerX = util.worldXCoordToLocalX(Manager.foods[i].position.x + Manager.foods[i].size.width/2, gameConfig.userOffset.x);
      var centerY = util.worldYCoordToLocalY(Manager.foods[i].position.y + Manager.foods[i].size.height/2, gameConfig.userOffset.y);
      ctx.arc(centerX, centerY, Manager.foods[i].size.width/2 * gameConfig.scaleFactor, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
    }
  }
};
function drawGrid(){
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#0000ff';
  ctx.globalAlpha = 0.15;
  ctx.beginPath();
 // - (gameConfig.CANVAS_MAX_LOCAL_SIZE.width * gameConfig.scaleFactor)/2
 //  - (gameConfig.CANVAS_MAX_LOCAL_SIZE.height * gameConfig.scaleFactor)/2
  for(var x = - gameConfig.userOffset.x; x<gameConfig.canvasSize.width; x += (gameConfig.CANVAS_MAX_LOCAL_SIZE.width * gameConfig.scaleFactor)/16){
    ctx.moveTo(x, 0);
    ctx.lineTo(x, gameConfig.canvasSize.height);
  }

  for(var y = - gameConfig.userOffset.y; y<gameConfig.canvasSize.height; y += (gameConfig.CANVAS_MAX_LOCAL_SIZE.height * gameConfig.scaleFactor)/10){
    ctx.moveTo(0, y);
    ctx.lineTo(gameConfig.canvasSize.width, y);
  }

  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.closePath();
};
function drawBackground(){
  ctx.fillStyle = "#11ff11";
  ctx.globalAlpha = 0.65;
  var posX = -gameConfig.userOffset.x;
  var posY = -gameConfig.userOffset.y;
  var sizeW = gameConfig.CANVAS_MAX_SIZE.width * gameConfig.scaleFactor - posX;
  var sizeH = gameConfig.CANVAS_MAX_SIZE.height * gameConfig.scaleFactor- posY;
  ctx.fillRect(posX, posY, sizeW, sizeH);
  ctx.globalAlpha = 1;
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
    if(keyCode === 32){
      socket.emit('reqSkill');
    }
  }, false);
};
function calcOffset(){
  return {
    x : Manager.users[gameConfig.userID].position.x + (Manager.users[gameConfig.userID].size.width * gameConfig.scaleFactor)/2 - gameConfig.canvasSize.width/(2 * gameConfig.scaleFactor),
    y : Manager.users[gameConfig.userID].position.y + (Manager.users[gameConfig.userID].size.height * gameConfig.scaleFactor)/2- gameConfig.canvasSize.height/(2 * gameConfig.scaleFactor)
  };
};
update();

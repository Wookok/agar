// inner Modules
var util = require('../../modules/public/util.js');
var User = require('../../modules/client/CUser.js');
var CManager = require('../../modules/client/CManager.js');
var gameConfig = require('../../modules/public/gameConfig.json');

var socket;

// document elements
var introScene, gameScene, standingScene;
var startButton;
var board;

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
    var userName = nameInput.value;
    if(util.checkNameIsValid(userName)){
      gameConfig.userName = userName;
      console.log(gameConfig.userName);
      changeState(gameConfig.GAME_STATE_GAME_START);
    }else{
      alert('Name is not valid');
    }
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
  socket.emit('reqStartGame', gameConfig.userName);
};
//game play on
function game(){
  drawGame();
};
//show end message and restart button
function end(){
  Manager.clearGame();
  changeState(gameConfig.GAME_STATE_START_SCENE);
};

//functions
function setBaseSetting(){
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');

  introScene = document.getElementById('introScene');
  gameScene = document.getElementById('gameScene');
  standingScene = document.getElementById('standingScene');
  startButton = document.getElementById('startButton');
  board = document.getElementById('board');
  nameInput = document.getElementById('name');

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
  introScene.classList.add('enable');
  introScene.classList.remove('disable');
  gameScene.classList.add('disable');
  gameScene.classList.remove('enable');
  standingScene.classList.add('disable');
  standingScene.classList.remove('enable');
};

function drawGame(){
  introScene.classList.add('disable');
  introScene.classList.remove('enable');
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
    drawUser();
    drawViruses();

    drawBoard();
  }
};
function drawBoard(){
  var usersMass = [];
  var rank = [];
  for(var index in Manager.users){
    var totalMass = Manager.users[index].mass;
    for(var i=0; i<Manager.users[index].clones.length; i++){
      totalMass += Manager.users[index].clones[i].mass;
    }
    usersMass.push({name : Manager.users[index].name, mass : totalMass});
  }
  for(var i=0; i<usersMass.length; i++){
    if(rank.length === 0){
      rank.push(usersMass[i]);
    }else{
      var insertIndex = 0;
      for(var j=0; j<rank.length; j++){
        if(rank[j].mass < usersMass[i].mass){
          insertIndex = j;
          break;
        }
        insertIndex ++;
      }
      rank.splice(insertIndex, 0, usersMass[i]);
    }
  }
  var nodesLength = board.childNodes.length;
  for(var i=0; i < nodesLength; i++){
    board.removeChild(board.childNodes[0]);
  }
  var x = document.createElement("H2");
  var t = document.createTextNode('Rank');
  x.appendChild(t);
  board.appendChild(x);

  if(rank.length > 10){
    var length = 10;
  }else{
    length = rank.length;
  }
  for(var i=0; i<length; i++){
    var x = document.createElement("P");
    var t = document.createTextNode(rank[i].name + ' : ' + Math.floor(rank[i].mass));
    x.appendChild(t);
    board.appendChild(x);
  }
};
// socket connect and server response configs
function setupSocket(){
  socket = io();
  socket.on('disconnect', function(){
    changeState(gameConfig.GAME_STATE_END);
  });
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
  socket.on('rename', function(){
    changeState(gameConfig.GAME_STATE_START_SCENE);
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
    ctx.font = "30px Arial";
    ctx.lineWidth = 5;

    var centerX = util.worldXCoordToLocalX(Manager.users[index].position.x + Manager.users[index].size.width/2, gameConfig.userOffset.x);
    var centerY = util.worldYCoordToLocalY(Manager.users[index].position.y + Manager.users[index].size.height/2, gameConfig.userOffset.y);

    ctx.arc(centerX * gameConfig.scaleFactor, centerY * gameConfig.scaleFactor, Manager.users[index].size.width/2 * gameConfig.scaleFactor, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fill();
    ctx.fillStyle = "#ffffff"
    ctx.textAlign = 'center';
    ctx.fillText(Manager.users[index].name,centerX * gameConfig.scaleFactor,centerY * gameConfig.scaleFactor + 10 * gameConfig.scaleFactor);
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

      ctx.fillStyle = "#ffffff"
      ctx.textAlign = 'center';
      ctx.fillText(Manager.users[index].name,centerX * gameConfig.scaleFactor,centerY * gameConfig.scaleFactor + 10 * gameConfig.scaleFactor);
      ctx.closePath();
    }
  }
};
function drawViruses(){
  for(var i=0; i<Manager.viruses.length; i++){
    var posX = util.worldXCoordToLocalX(Manager.viruses[i].position.x, gameConfig.userOffset.x);
    var posY = util.worldYCoordToLocalY(Manager.viruses[i].position.y, gameConfig.userOffset.y);

    ctx.drawImage(imgVirus, posX * gameConfig.scaleFactor, posY * gameConfig.scaleFactor, Manager.viruses[i].size.width * gameConfig.scaleFactor, Manager.viruses[i].size.height * gameConfig.scaleFactor);
  }
};
function drawFoods(){
  for(var i=0; i<Manager.foods.length; i++){
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
  ctx.fillStyle = "#70ccc4";
  ctx.globalAlpha = 0.6;
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

  for(var x = - gameConfig.userOffset.x; x<=gameConfig.CANVAS_MAX_SIZE.width/gameConfig.scaleFactor; x += gameConfig.CANVAS_MAX_LOCAL_SIZE.width/32){
    if(util.isXInCanvas(x, gameConfig)){
      ctx.moveTo(x * gameConfig.scaleFactor, 0);
      ctx.lineTo(x * gameConfig.scaleFactor, gameConfig.canvasSize.height);
    }
  };

  for(var y = - gameConfig.userOffset.y; y<=gameConfig.CANVAS_MAX_SIZE.height/gameConfig.scaleFactor; y += gameConfig.CANVAS_MAX_LOCAL_SIZE.height/20){
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
    var targetPosition = {
      x : e.clientX / gameConfig.scaleFactor,
      y : e.clientY / gameConfig.scaleFactor
    };
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
  var userCenterX = Manager.users[gameConfig.userID].position.x + Manager.users[gameConfig.userID].size.width/2;
  var userCenterY = Manager.users[gameConfig.userID].position.y + Manager.users[gameConfig.userID].size.height/2;
  var clonesCenterX = 0;
  var clonesCenterY = 0;
  var cloneCount = Manager.users[gameConfig.userID].clones.length;
  for(var i=0; i<cloneCount; i++){
    clonesCenterX += Manager.users[gameConfig.userID].clones[i].position.x + Manager.users[gameConfig.userID].clones[i].size.width/2;
    clonesCenterY += Manager.users[gameConfig.userID].clones[i].position.y + Manager.users[gameConfig.userID].clones[i].size.height/2;
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

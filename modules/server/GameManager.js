var config = require('../../config.json');
var gameConfig = require('../public/gameConfig.json');
var util = require('../public/util.js');
var QuadTree = require('quadtree-lib');
var Food = require('./Food.js');

var INTERVAL_TIMER = 1000/gameConfig.INTERVAL;

function GameManager(){
  this.users = [];
  this.foods = [];
  this.updateInteval = false;
  this.affectInterval = false;

  this.userTree = new QuadTree({
    width : gameConfig.CANVAS_MAX_SIZE.width,
    height : gameConfig.CANVAS_MAX_SIZE.height,
    maxElements : 5
  });
  this.userEles = [];
  this.colliderEles = [];
  this.affectedEles = []

  this.staticTree = new QuadTree({
    width : gameConfig.CANVAS_MAX_SIZE.width,
    height : gameConfig.CANVAS_MAX_SIZE.height,
    maxElements : 5
  });
  this.staticEles = [];

  this.onDeleteFood = new Function();
};

GameManager.prototype.start = function(){
  this.mapSetting();
  this.updateGame();
};
GameManager.prototype.mapSetting = function(){
  for(var i=0; i<gameConfig.FOOD_MIN_COUNT; i++){
    //make Foods
    var randomID = generateRandomUniqueID('F', this.foods);
    var food = new Food(randomID);
    var randomRadius = generateRandomRadius(gameConfig.FOOD_MIN_RADIUS, gameConfig.FOOD_MAX_RADIUS);
    var randomPos = generateRandomPos(this.staticTree, 0, 0, gameConfig.CANVAS_MAX_SIZE.width, gameConfig.CANVAS_MAX_SIZE.height,
                                      randomRadius, gameConfig.FOOD_RANGE_WITH_OTHERS, randomID);
    var mass = radiusToMass(randomRadius);
    var randomColor = generateRandomColor();

    food.initFood(randomPos, randomRadius, mass, randomColor);
    food.setStaticEle();
    // this.staticTree.push(food.staticEle);
    this.foods.push(food);
    this.staticTree.push(food.staticEle);
  }
};

GameManager.prototype.updateGame = function(){
  if(this.updateInteval === false){
    this.updateInteval = setInterval( updateIntervalHandler.bind(this), INTERVAL_TIMER);
  }
  if(this.affectInterval === false){
    this.affectInterval = setInterval(affectIntervalHandler.bind(this), INTERVAL_TIMER);
  }
};
//setting User for moving and move user;
GameManager.prototype.setUserTargetAndMove = function(user, targetPosition){
  user.setTargetPosition(targetPosition);
  user.setTargetDirection();
  user.setSpeed();

  user.changeState(gameConfig.OBJECT_STATE_MOVE);
};

// user join, kick, update
GameManager.prototype.joinUser = function(user){
  this.users[user.objectID] = user;
  console.log(this.users);
  console.log(user.objectID + ' join in GameManager');
};
GameManager.prototype.kickUser = function(user){
  if(!(user.objectID in this.users)){
    console.log("can`t find user`s ID. something is wrong");
  }else{
    delete this.users[user.objectID];
  }
};
GameManager.prototype.updateUser = function(user){
  if(!(user.objectID in this.users)){
    console.log("can`t find user`s ID. something is wrong");
  }else{
    this.users[user.objectID] = user;
  }
};
//user initialize
GameManager.prototype.initializeUser = function(user){
  // check ID is unique
  var randomID = generateRandomUniqueID('U', this.users);
  user.assignID(randomID);

  user.setSize(64,64);
  user.setPosition(10, 10);

  user.setRotateSpeed(10);
  user.setMaxSpeed(10);
};
GameManager.prototype.stopUser = function(user){
  user.stop();
};

GameManager.prototype.deleteFood = function(foodID, userID, userMass){
  for(var i=0; i<Object.keys(this.foods).length; i++){
    if(this.foods[i].objectID === foodID){
      this.foods.splice(i, 1);
      this.onDeleteFood(foodID, userID, userMass);
      return;
    }
  }
};
// data setting for send to client
GameManager.prototype.updateDataSettings = function(){
  var userData = [];

  for(var index in this.users){
    var tempUser = {
      objectID : index,

      currentState : this.users[index].currentState,
      position : this.users[index].position,
      targetPosition : this.users[index].targetPosition,

      // speed : this.users[index].speed,
      maxSpeed : this.users[index].maxSpeed,

      direction : this.users[index].direction,

      rotateSpeed :  this.users[index].rotateSpeed,
      // targetDirection : this.users[index].targetDirection,

      size : this.users[index].size
    };
    userData.push(tempUser);
  };

  return userData;
};
GameManager.prototype.updateDataSetting = function(user){
  var updateUser = {
    objectID : user.objectID,

    currentState : user.currentState,
    position : user.position,
    targetPosition : user.targetPosition,

    // speed : user.speed,
    maxSpeed : user.maxSpeed,
    direction : user.direction,

    rotateSpeed :  user.rotateSpeed,
    // targetDirection : user.targetDirection,

    size : user.size
  };
  return updateUser;
};
GameManager.prototype.updateFoodsDataSettings = function(){
  var foodsDatas = [];
  for(var i =0; i<this.foods.length; i++){
    var food = {
      objectID : this.foods[i].objectID,
      color : this.foods[i].color,
      position : this.foods[i].position,
      size : this.foods[i].size
    }
    foodsDatas.push(food);
  }
  return foodsDatas;
};

function updateIntervalHandler(){
  //staticEle : food, collider : user
  // console.log(this.userEles);
  // console.log('userEles.length : ' + this.userEles.length);
  for(var i=0; i<this.userEles.length; i++){
    var tempCollider = this.userEles[i];
    var collisionObjs = util.checkCircleCollision(this.staticTree, tempCollider.x, tempCollider.y, tempCollider.width/2, tempCollider.id);
    if(collisionObjs.length > 0){
      for(var j=0; j<collisionObjs.length; j++){
        this.affectedEles.push({'userID' : tempCollider.id, 'foodID' : collisionObjs[j].id, 'foodMass' : collisionObjs[j].mass });
      }
    }
    // this.staticTree.onCollision(tempCollider, function(item){
    //   if(tempCollider.id !== item.id){
    //     var colCenterX = tempCollider.x + tempCollider.width/2;
    //     var colCenterY = tempCollider.y + tempCollider.height/2;
    //
    //     var itemCenterX = item.x + item.width/2;
    //     var itemCenterY = item.y + item.height/2;
    //
    //     var dist = Math.pow(itemCenterX - colCenterX,2) + Math.pow(itemCenterY - colCenterY ,2);
    //     if(dist < Math.pow(tempCollider.width/2 + item.width/2, 2)){
    //       console.log('collision is occured');
    //     }
    //   }
    // });
  }
  //clear tree and treeArray
  for(var index in this.userEles){
    this.userTree.remove(this.userEles[index]);
  }
  this.userEles = [];
  // this.colliderEles = [];

  //updateUserArray
  for(var index in this.users){
    this.users[index].setUserEle();
    this.userEles.push(this.users[index].userTreeEle);
  }
  //test

  //put users data to tree
  this.userTree.pushAll(this.userEles);
};
function affectIntervalHandler(){
  var index = this.affectedEles.length
  while(index--){
    var userMass = this.users[this.affectedEles[index].userID].addMass(this.affectedEles[index].foodMass);
    //userMass will be used for inform to client
    this.deleteFood(this.affectedEles[index].foodID, this.affectedEles[index].userID, userMass);
    this.affectedEles.splice(index, 1);
  }
}
function generateRandomUniqueID(prefix, uniqueCheckArray){
  var IDisUnique = false;
  while(!IDisUnique){
    var randomID = generateRandomID(prefix);
    IDisUnique = true;
    for(var index in uniqueCheckArray){
      if(randomID == uniqueCheckArray[index].objectID){
        IDisUnique = false;
      }
    }
  }
  return randomID;
}
function generateRandomID(prefix){
  var output = prefix;
  for(var i=0; i<6; i++){
    output += Math.floor(Math.random()*16).toString(16);
  }
  return output;
};
function generateRandomPos(checkTree, minX, minY, maxX, maxY, radius, diffRangeWithOthers, objID){
  var isCollision = true;
  while(isCollision){
    isCollision = false;
    var pos = {
      x : Math.floor(Math.random()*(maxX - minX) + minX),
      y : Math.floor(Math.random()*(maxY - minY) + minY)
    }
    var collisionObjs = util.checkCircleCollision(checkTree, pos.x, pos.y, radius + diffRangeWithOthers, objID);
    if(collisionObjs.length > 0){
      isCollision = true;
    }
  }
  return pos;
};
function generateRandomRadius(minRadius, maxRadius){
  return Math.floor(Math.random()*(maxRadius - minRadius) + minRadius);
};
function radiusToMass(radius){
  return Math.pow((radius-4)/6,2);
};
function massToRadius(mass){
  return 4 + Math.sqrt(mass) * 6;
};
function generateRandomColor(){
  var output = "#";
  for(var i=0; i<6; i++){
    output += Math.floor(Math.random()*16).toString(16);
  }
  return output;
};

module.exports = GameManager;

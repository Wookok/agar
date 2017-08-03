var config = require('../../config.json');
var gameConfig = require('../public/gameConfig.json');
var util = require('../public/util.js');
var SUtil = require('./ServerUtil');
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
  this.userCloneEles = [];
  this.colliderEles = [];
  this.affectedEles = [];

  this.staticTree = new QuadTree({
    width : gameConfig.CANVAS_MAX_SIZE.width,
    height : gameConfig.CANVAS_MAX_SIZE.height,
    maxElements : 5
  });
  this.staticEles = [];

  this.foodsCount = gameConfig.FOOD_MIN_COUNT;
  this.onCreateFoods = new Function();
  this.onDeleteFood = new Function();
};

GameManager.prototype.start = function(){
  this.mapSetting();
  this.updateGame();
};
GameManager.prototype.mapSetting = function(){
  this.setFoods();
};
GameManager.prototype.setFoods = function(){
  for(var i=0; i<this.foodsCount; i++){
    var randomID = SUtil.generateRandomUniqueID('F', this.foods);
    var food = new Food(randomID);
    var randomRadius = SUtil.generateRandomRadius(gameConfig.FOOD_MIN_RADIUS, gameConfig.FOOD_MAX_RADIUS);
    var randomPos = SUtil.generateRandomPos(this.staticTree, 0, 0, gameConfig.CANVAS_MAX_SIZE.width, gameConfig.CANVAS_MAX_SIZE.height,
                                      randomRadius, gameConfig.FOOD_RANGE_WITH_OTHERS, randomID);
    var mass = SUtil.radiusToMass(randomRadius);
    var randomColor = SUtil.generateRandomColor();

    food.initFood(randomPos, randomRadius, mass, randomColor);
    food.setStaticEle();
    // this.staticTree.push(food.staticEle);
    this.foods.push(food);
    this.staticEles.push(food.staticEle);
    this.staticTree.push(food.staticEle);
  }
};
GameManager.prototype.makeFood = function(count){
  var createdFoods = [];
  for(var i=0; i<count; i++){
    var randomID = SUtil.generateRandomUniqueID('F', this.foods);
    var food = new Food(randomID);
    var randomRadius = SUtil.generateRandomRadius(gameConfig.FOOD_MIN_RADIUS, gameConfig.FOOD_MAX_RADIUS);
    var randomPos = SUtil.generateRandomPos(this.staticTree, 0, 0, gameConfig.CANVAS_MAX_SIZE.width, gameConfig.CANVAS_MAX_SIZE.height,
                                      randomRadius, gameConfig.FOOD_RANGE_WITH_OTHERS, randomID);
    var mass = SUtil.radiusToMass(randomRadius);
    var randomColor = SUtil.generateRandomColor();

    food.initFood(randomPos, randomRadius, mass, randomColor);
    food.setStaticEle();
    // this.staticTree.push(food.staticEle);
    this.foods.push(food);
    createdFoods.push(food);
  }
  this.onCreateFoods(createdFoods);
};
GameManager.prototype.updateGame = function(){
  if(this.updateInteval === false){
    this.updateInteval = setInterval( updateIntervalHandler.bind(this), INTERVAL_TIMER);
  }
  if(this.affectInterval === false){
    this.affectInterval = setInterval(affectIntervalHandler.bind(this), INTERVAL_TIMER);
  }
};

GameManager.prototype.fireClone = function(user){
  var cloneID = SUtil.generateRandomUniqueID('C', user.clones);
  console.log(cloneID);
  user.makeClone(cloneID);
};
//setting User for moving and move user;
GameManager.prototype.setUserTargetAndMove = function(user, targetPosition){
  user.setTargetPosition(targetPosition);
  user.setTargetDirection();
  user.setSpeed();

  user.clonesSetting();

  user.changeState(gameConfig.OBJECT_STATE_MOVE);
  user.clonesChangeState(gameConfig.OBJECT_STATE_MOVE);
};

// user join, kick, update
GameManager.prototype.joinUser = function(user){
  this.users[user.objectID] = user;
  this.foodsCount += gameConfig.FOOD_ADD_PER_USER;
  console.log(this.users);
  console.log(user.objectID + ' join in GameManager');
};
GameManager.prototype.kickUser = function(user){
  if(!(user.objectID in this.users)){
    console.log("can`t find user`s ID. something is wrong");
  }else{
    delete this.users[user.objectID];
    this.foodsCount -= gameConfig.FOOD_ADD_PER_USER;
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
  var randomID = SUtil.generateRandomUniqueID('U', this.users);
  user.assignID(randomID);

  user.setSize(64,64);
  user.setPosition(10, 10);

  user.setRotateSpeed(60);
  user.setMaxSpeed(10);
};
GameManager.prototype.stopUser = function(user){
  user.stop();
};

GameManager.prototype.deleteFood = function(foodID, affectedID, userRadius){
  for(var i=0; i<Object.keys(this.foods).length; i++){
    if(this.foods[i].objectID === foodID){
      this.foods.splice(i, 1);
      this.onDeleteFood(foodID, affectedID, userRadius);
      return;
    }
  }
};
// data setting for send to client
GameManager.prototype.updateDataSettings = function(){
  var userData = [];

  for(var index in this.users){
    var clonesData = [];
    for(var i=0; i<Object.keys(this.users[index].clones).length; i++){
        clonesData.push({
          objectID : this.users[index].clones[i].objectID,

          currentState : this.users[index].clones[i].currentState,
          position : this.users[index].clones[i].position,
          targetPosition : this.users[index].clones[i].targetPosition,

          // speed : this.users[index].speed,
          maxSpeed : this.users[index].clones[i].maxSpeed,

          direction : this.users[index].clones[i].direction,

          rotateSpeed :  this.users[index].clones[i].rotateSpeed,
          // targetDirection : this.users[index].targetDirection,

          size : this.users[index].clones[i].size
        });
    }
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

      size : this.users[index].size,
      clones : clonesData
    };
    userData.push(tempUser);
  };

  return userData;
};
GameManager.prototype.updateDataSetting = function(user){
  var clonesData = [];
  for(var i=0; i<Object.keys(user.clones).length; i++){
      clonesData.push({
        objectID : user.clones[i].objectID,

        currentState : user.clones[i].currentState,
        position : user.clones[i].position,
        targetPosition : user.clones[i].targetPosition,

        // speed : this.users[index].speed,
        maxSpeed : user.clones[i].maxSpeed,

        direction : user.clones[i].direction,

        rotateSpeed : user.clones[i].rotateSpeed,
        // targetDirection : this.users[index].targetDirection,

        size : user.clones[i].size
      });
  }
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

    size : user.size,
    clones : clonesData
  };
  console.log(updateUser.position);
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
GameManager.prototype.updateFoodDataSetting = function(food){
  return {
    objectID : food.objectID,
    color : food.color,
    position : food.position,
    size : food.size
  };
}
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
  }
  for(var i=0; i<this.userCloneEles.length; i++){
    var tempCollider = this.userCloneEles[i];
    var collisionObjs = util.checkCircleCollision(this.staticTree, tempCollider.x, tempCollider.y, tempCollider.width/2, tempCollider.id);
    if(collisionObjs.length > 0){
      for(var j=0; j<collisionObjs.length; j++){
        this.affectedEles.push({'cloneID' : tempCollider.cloneID,'userID' : tempCollider.id, 'foodID' : collisionObjs[j].id, 'foodMass' : collisionObjs[j].mass });
      }
    }
  }
  //clear tree and treeArray
  for(var i=0; i<this.userEles.length; i++){
    this.userTree.remove(this.userEles[i]);
  }
  for(var i=0; i<this.userCloneEles.length; i++){
    this.userTree.remove(this.userCloneEles[i]);
  }
  for(var i=0; i<this.staticEles.length; i++){
    this.staticTree.remove(this.staticEles[i]);
  }
  this.userEles = [];
  this.userCloneEles = [];
  this.staticEles = [];
  // this.colliderEles = [];

  //updateUserArray
  for(var index in this.users){
    this.users[index].setUserEle();
    for(var i=0; i<this.users[index].clones.length; i++){
      this.users[index].clones[i].setCloneEle();
      this.userCloneEles.push(this.users[index].clones[i].userTreeEle);
    }
    this.userEles.push(this.users[index].userTreeEle);
  }
  //updateFoodsArray
  var addFoodsCount = this.foodsCount - Object.keys(this.foods).length;
  if(addFoodsCount > 0){
    this.makeFood(addFoodsCount);
  }
  for(var i=0; i<Object.keys(this.foods).length; i++){
    this.staticEles.push(this.foods[i].staticEle);
  }

  //put users data to tree
  this.userTree.pushAll(this.userEles);
  this.userTree.pushAll(this.userCloneEles);
  this.staticTree.pushAll(this.staticEles);
};
function affectIntervalHandler(){
  var index = this.affectedEles.length
  while(index--){
    if(this.affectedEles[index].cloneID){
      for(var i=0; i<Object.keys(this.users[this.affectedEles[index].userID].clones).length; i++){
        if(this.users[this.affectedEles[index].userID].clones[i].objectID === this.affectedEles[index].cloneID){
          var cloneIndex = i;
        }
      }
      if(cloneIndex !== -1){
        var cloneRadius = this.users[this.affectedEles[index].userID].clones[cloneIndex].addMass(this.affectedEles[index].foodMass);
        this.deleteFood(this.affectedEles[index].foodID, this.affectedEles[index].cloneID, cloneRadius);
      }else{
        console.log('cant find clone Index');
      }
    }else{
      var userRadius = this.users[this.affectedEles[index].userID].addMass(this.affectedEles[index].foodMass);
      //userMass will be used for inform to client
      this.deleteFood(this.affectedEles[index].foodID, this.affectedEles[index].userID, userRadius);
    }
    this.affectedEles.splice(index, 1);
  }
};

module.exports = GameManager;

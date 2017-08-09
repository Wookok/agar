var config = require('../../config.json');
var gameConfig = require('../public/gameConfig.json');
var serverConfig = require('./serverConfig.json');
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
  this.sendPacketInterval = false;

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
  this.onUserFusion = new Function();
  this.onUpdateUser = new Function();
  this.onUserDestroy = new Function();
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
  if(this.sendPacketInterval === false){
    this.sendPacketInterval = setInterval(sendPacketIntervalHandler.bind(this), INTERVAL_TIMER);
  }
};
function sendPacketIntervalHandler(){
  this.onUpdateUser();
};
GameManager.prototype.fireClone = function(user){
  var cloneID = SUtil.generateRandomUniqueID('C', user.clones);
  user.makeClone(cloneID);
  for(var i=0; i<Object.keys(user.clones).length; i++){
    var randID = SUtil.generateRandomUniqueID('C', user.clones);
  }
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
  var thisUsers = this.users
  var thisOnUserDestroy = this.onUserDestroy;
  user.onDestroy = function(){
    delete thisUsers[user.objectID];
    thisOnUserDestroy(user.objectID);
  };
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

  user.setPosition(10, 10);

  user.setRotateSpeed(serverConfig.baseMaxSpeed);
  user.setMaxSpeed(serverConfig.baseRotateSpeed);
  user.setMass(serverConfig.baseMass);
  // user.onFusion = this.onUserFusion;
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
GameManager.prototype.findWinnerAndLoser = function(userID1, userID2, cloneID1, cloneID2){
  if(userID1 in this.users && userID2 in this.users){
    if(cloneID1){
      for(var i=0; i<this.users[userID1].clones.length; i++){
        if(this.users[userID1].clones[i].objectID === cloneID1){
          var col1 = this.users[userID1].clones[i];
          break;
        }
      }
    }else{
      col1 = this.users[userID1];
    }
    if(cloneID2){
      for(var i=0; i<this.users[userID2].clones.length; i++){
        if(this.users[userID2].clones[i].objectID === cloneID2){
          var col2 = this.users[userID2].clones[i];
          break;
        }
      }
    }else{
      col2 = this.users[userID2];
    }
  }
  if(col1 && col2){
    if(col1.size.width > col2.size.width * serverConfig.collisionFactor){
      return {
        winner : col1,
        loser : col2
      }
    }else if(col2.size.width > col1.size.width * serverConfig.collisionFactor){
      // return {
      //   winner : col2,
      //   loser : col1
      // };
      return false;
    }else{
      console.log('nobody win');
      return false;
    }
  }else{
    console.log('cant find collider');
    return false;
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
          position : this.users[index].clones[i].position,
          size : this.users[index].clones[i].size
        });
    }
    var tempUser = {
      objectID : index,
      position : this.users[index].position,
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
        position : user.clones[i].position,
        size : user.clones[i].size
      });
  }
  var updateUser = {
    objectID : user.objectID,
    position : user.position,
    size : user.size,
    clones : clonesData
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
GameManager.prototype.updateFoodDataSetting = function(food){
  return {
    objectID : food.objectID,
    color : food.color,
    position : food.position,
    size : food.size
  };
}
function updateIntervalHandler(){
  //collision with food
  for(var i=0; i<this.userEles.length; i++){
    var tempCollider = this.userEles[i];
    var collisionObjs = util.checkCircleCollision(this.staticTree, tempCollider.x, tempCollider.y, tempCollider.width/2, tempCollider.id);
    if(collisionObjs.length > 0){
      for(var j=0; j<collisionObjs.length; j++){
        this.affectedEles.push({'type' : serverConfig.COLLISION_WITH_FOOD,'userID' : tempCollider.id, 'foodID' : collisionObjs[j].id, 'foodMass' : collisionObjs[j].mass });
      }
    }
  }
  for(var i=0; i<this.userCloneEles.length; i++){
    var tempCollider = this.userCloneEles[i];
    var collisionObjs = util.checkCircleCollision(this.staticTree, tempCollider.x, tempCollider.y, tempCollider.width/2, tempCollider.id);
    if(collisionObjs.length > 0){
      for(var j=0; j<collisionObjs.length; j++){
        this.affectedEles.push({'type' : serverConfig.COLLISION_WITH_FOOD, 'cloneID' : tempCollider.cloneID,'userID' : tempCollider.id, 'foodID' : collisionObjs[j].id, 'foodMass' : collisionObjs[j].mass });
      }
    }
  }
  //collision with other user
  for(var i=0; i<this.userEles.length; i++){
    var tempCollider = this.userEles[i];
    var collisionObjs = util.checkCircleCollision(this.userTree, tempCollider.x, tempCollider.y, tempCollider.width/2, tempCollider.id);
    if(collisionObjs.length > 0){
      for(var j=0; j<collisionObjs.length; j++){
        if(collisionObjs[j].objectID){
          this.affectedEles.push({'type' : serverConfig.COLLISION_WITH_USER,
          'userOneID' : tempCollider.id, 'userTwoID' : collisionObjs[j].id, 'userTwoCloneID' : collisionObjs[j].objectID });
        }else{
          this.affectedEles.push({'type' : serverConfig.COLLISION_WITH_USER,
          'userOneID' : tempCollider.id, 'userTwoID' : collisionObjs[j].id});
        }
      }
    }
  }
  for(var i=0; i<this.userCloneEles.length; i++){
    var tempCollider = this.userCloneEles[i];
    var collisionObjs = util.checkCircleCollision(this.userTree, tempCollider.x, tempCollider.y, tempCollider.width/2, tempCollider.id);
    if(collisionObjs.length > 0){
      for(var j=0; j<collisionObjs.length; j++){
        if(collisionObjs[j].objectID){
          this.affectedEles.push({'type' : serverConfig.COLLISION_WITH_USER,
          'userOneID' : tempCollider.id, 'userOneCloneID' : tempCollider.objectID, 'userTwoID' : collisionObjs[j].id, 'userTwoCloneID' : collisionObjs[j].objectID });
        }else{
          this.affectedEles.push({'type' : serverConfig.COLLISION_WITH_USER,
          'userOneID' : tempCollider.id, 'userOneCloneID' : tempCollider.objectID, 'userTwoID' : collisionObjs[j].id});
        }
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
    if(this.affectedEles[index].type === serverConfig.COLLISION_WITH_FOOD){
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
    }else if(this.affectedEles[index].type === serverConfig.COLLISION_WITH_USER){
      if(this.affectedEles[index].userOneCloneID){
        if(this.affectedEles[index].userTwoCloneID){
          //case 1 (clone to clone)
          var winnerAndLoser = this.findWinnerAndLoser(this.affectedEles[index].userOneID,
              this.affectedEles[index].userTwoID, this.affectedEles[index].userOneCloneID, this.affectedEles[index].userTwoCloneID);
          if(winnerAndLoser){
            winnerAndLoser.winner.addMass(winnerAndLoser.loser.mass);
            winnerAndLoser.loser.destroy();
          }
        }else{
          //case 2 (clone to user)
          var winnerAndLoser = this.findWinnerAndLoser(this.affectedEles[index].userOneID,
              this.affectedEles[index].userTwoID, this.affectedEles[index].userOneCloneID);
          if(winnerAndLoser){
            winnerAndLoser.winner.addMass(winnerAndLoser.loser.mass);
            winnerAndLoser.loser.destroy();
          }
        }
      }else if(this.affectedEles[index].userTwoCloneID){
        //case 3 (user to clone)
        var winnerAndLoser = this.findWinnerAndLoser(this.affectedEles[index].userOneID,
            this.affectedEles[index].userTwoID, undefined, this.affectedEles[index].userTwoCloneID);
        if(winnerAndLoser){
          winnerAndLoser.winner.addMass(winnerAndLoser.loser.mass);
          winnerAndLoser.loser.destroy();
        }
      }else{
        //case 4 (user to user)
        var winnerAndLoser = this.findWinnerAndLoser(this.affectedEles[index].userOneID,
            this.affectedEles[index].userTwoID);
        if(winnerAndLoser){
          winnerAndLoser.winner.addMass(winnerAndLoser.loser.mass);
          winnerAndLoser.loser.destroy();
        }
      }
    }
    this.affectedEles.splice(index, 1);
  }
};

module.exports = GameManager;

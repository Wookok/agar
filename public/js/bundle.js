(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var LivingEntity = require('./CLivingEntity.js');
var util = require('../public/util.js');

var Clone = function(cloneData, gameConfig, userID){
  LivingEntity.call(this, cloneData, gameConfig);

  this.objectID = cloneData.objectID;
  this.userID = userID;

  this.onMoveFindUserAndClones = new Function();
};
Clone.prototype = Object.create(LivingEntity.prototype);
Clone.prototype.constructor = Clone;

Clone.prototype.moveClone = function(){
  this.setSpeed();
  this.changeState(this.gameConfig.OBJECT_STATE_MOVE);
};
Clone.prototype.move = function(){
  var addPos = {x : 0, y : 0};
  //find user and other clones
  var others = this.onMoveFindUserAndClones();
  //check distance with others
  for(var i=0; i<others.length; i++){
    var vecX = this.center.x - others[i].center.x;
    var vecY = this.center.y - others[i].center.y;

    var dist = Math.sqrt(Math.pow(vecX, 2) + Math.pow(vecY, 2));
    if(dist < Math.abs(this.size.width/2 + others[i].size.width/2)){
      var distDiff = this.size.width/2 + others[i].size.width/2 - dist;
      if(vecX === 0){
        var ratioXYSqure = Infinity;
      }else{
        ratioXYSqure = Math.pow(vecY/vecX, 2);
      }
      var distFactorX = distDiff * Math.sqrt(1/(1 + ratioXYSqure));
      var distFactorY = distDiff * Math.sqrt((ratioXYSqure)/(1 + ratioXYSqure));

      addPos.x += (vecX > 0 ? 1 : -1) * distFactorX;
      addPos.y += (vecY > 0 ? 1 : -1) * distFactorY;
    }
  }
  //if collision calculate distance
  // console.log(this.position);
  util.move.call(this, addPos);
};
module.exports = Clone;

},{"../public/util.js":7,"./CLivingEntity.js":2}],2:[function(require,module,exports){
var util = require('../public/util.js');

var LivingEntity = function(entityData, gameConfig){
  this.gameConfig = gameConfig;

  this.currentState = null;
  this.size = entityData.size;

  this.position = util.worldToLocalPosition(entityData.position, this.gameConfig.userOffset);
  this.targetPosition = util.worldToLocalPosition(entityData.targetPosition, this.gameConfig.userOffset);
  this.direction = entityData.direction;
  this.rotateSpeed = entityData.rotateSpeed;

  this.maxSpeed = entityData.maxSpeed;

  this.center = {x : 0, y : 0};
  this.speed = {x : 0, y : 0};
  this.targetDirection = 0;

  this.setCenter();
  this.setSpeed();
  this.setTargetDirection();

  this.updateInterval = false;
  this.updateFunction = null;

  this.onMoveOffset = null;
};
LivingEntity.prototype = {
  changeState : function(newState){

    this.currentState = newState;

    this.stop();
    switch (this.currentState) {
      case this.gameConfig.OBJECT_STATE_IDLE:
        this.updateFunction = null;
        break;
      case this.gameConfig.OBJECT_STATE_MOVE:
        this.updateFunction = this.rotate.bind(this);
        break;
      case this.gameConfig.OBJECT_STATE_MOVE_OFFSET:
        this.updateFunction = this.rotate.bind(this);
        break;
    }
    this.update();
  },
  update : function(){
    var INTERVAL_TIMER = Math.floor(1000/this.gameConfig.INTERVAL);
    this.updateInterval = setInterval(this.updateFunction, INTERVAL_TIMER);
  },
  setCenter : function(){
    this.center.x = this.position.x + this.size.width/2,
    this.center.y = this.position.y + this.size.height/2
  },
  setSize : function(radius){
    this.size.width = radius * 2;
    this.size.height = radius * 2;
    this.setCenter();
  },
  rotate : function(){
    util.rotate.call(this);
  },
  move : function(){
    util.move.call(this);
  },
  setTargetDirection : function(){
    util.setTargetDirection.call(this);
  },
  setSpeed : function(){
    util.setSpeed.call(this);
  },
  moveOffset : function(){
    var distX = this.targetPosition.x - this.center.x;
    var distY = this.targetPosition.y - this.center.y;

    if(distX == 0 && distY == 0){
      this.stop();
      this.changeState(this.gameConfig.OBJECT_STATE_IDLE);
    }
    if(Math.abs(distX) < Math.abs(this.speed.x)){
      this.speed.x = distX;
    }
    if(Math.abs(distY) < Math.abs(this.speed.y)){
      this.speed.y = distY;
    }
    this.targetPosition.x -= this.speed.x;
    this.targetPosition.y -= this.speed.y;

    this.gameConfig.userOffset.x += this.speed.x;
    this.gameConfig.userOffset.y += this.speed.y;

    for(var i=0; i<Object.keys(this.clones).length; i++){
      this.clones[i].targetPosition.x -= this.clones[i].speed.x;
      this.clones[i].targetPosition.y -= this.clones[i].speed.y;

      this.clones[i].center.x -= this.clones[i].speed.x;
      this.clones[i].center.y -= this.clones[i].speed.y;

      this.clones[i].position.x -= this.clones[i].speed.x;
      this.clones[i].position.y -= this.clones[i].speed.y
    }
    this.onMoveOffset();
  },
  addPosAndTargetPos : function(addPosX , addPosY){
    this.position.x += addPosX;
    this.position.y += addPosY;

    this.targetPosition.x += addPosX;
    this.targetPosition.y += addPosY;

    this.setCenter();
  },
  stop : function(){
    if(this.updateInterval){
      clearInterval(this.updateInterval);
      this.updateInterval = false;
    }
  }
};

module.exports = LivingEntity;

},{"../public/util.js":7}],3:[function(require,module,exports){
var User = require('./CUser.js');
var Clone = require('./CClone.js');
var util = require('../public/util.js');

var CManager = function(gameConfig){
	this.gameConfig = gameConfig;

	//user correspond client
	this.user = null;
	//all users
	this.users = [];
	this.foods = [];
};

CManager.prototype = {
	setUser : function(userData){
		if(!this.checkUserAtUsers(userData)){
			var tempUser = new User(userData, this.gameConfig);
			this.users[userData.objectID] = tempUser;
			this.users[userData.objectID].changeState(userData.currentState);
		}else{
			console.log('user.objectID duplicated. something is wrong.');
		}
	},
	setUsers : function(userDatas){
		for(var index in userDatas){
			var tempUser = new User(userDatas[index], this.gameConfig);
			this.users[userDatas[index].objectID] = tempUser;
			this.users[userDatas[index].objectID].changeState(userDatas[index].currentState);
		}
	},
	updateRadius : function(userID, userRadius){
		if(Object.keys(this.users).indexOf(userID) !== -1){
			this.users[userID].setSize(userRadius);
		}
	},
	setFoods : function(foodsDatas){
		for(var i =0; i<Object.keys(foodsDatas).length; i++){
			foodsDatas[i].position = util.worldToLocalPosition(foodsDatas[i].position, this.gameConfig.userOffset);
			this.foods.push(foodsDatas[i]);
		}
	},
	createFoods : function(foodsDatas){
		for(var i =0; i<Object.keys(foodsDatas).length; i++){
			foodsDatas[i].position = util.worldToLocalPosition(foodsDatas[i].position, this.gameConfig.userOffset);
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
			console.log("user already out");
		}else{
			delete this.users[objID];
		}
	},
	updateUsers : function(){

	},
	deleteClone : function(userID, cloneID){
		for(var i=0; i<this.users[userID].clones.length; i++){
			if(cloneID === this.users[userID].clones[i].objectID){
				this.users[userID].clones.splice(i, 1);
			}
		}
	},
	updateUserData : function(userData){
		if(this.checkUserAtUsers(userData)){
			this.users[userData.objectID].position = util.worldToLocalPosition(userData.position, this.gameConfig.userOffset);
			this.users[userData.objectID].targetPosition = util.worldToLocalPosition(userData.targetPosition, this.gameConfig.userOffset);
			// this.users[userData.objectID].speed.x = userData.speed.x;
			// this.users[userData.objectID].speed.y = userData.speed.y;

			this.users[userData.objectID].direction = userData.direction;
			this.users[userData.objectID].rotateSpeed = userData.rotateSpeed;
			this.users[userData.objectID].size = userData.size;
			// this.users[userData.objectID].targetDirection = userData.targetDirection;
			// this.users[userData.objectID].clones = userData.clones;

			this.users[userData.objectID].setCenter();
			this.users[userData.objectID].setTargetDirection();
			this.users[userData.objectID].setSpeed();

			for(var i=0; i<Object.keys(userData.clones).length; i++){
				//check clone is exist
				//if exist update position
				//else make clone
				if(util.isExistsClone(this.users[userData.objectID].clones, userData.clones[i])){
					for(var j=0; j<this.users[userData.objectID].clones.length; j++){
						if(this.users[userData.objectID].clones[j].objectID === userData.clones[i].objectID){
							this.users[userData.objectID].clones[j].position = util.worldToLocalPosition(userData.clones[i].position, this.gameConfig.userOffset);
							this.users[userData.objectID].clones[j].targetPosition = util.worldToLocalPosition(userData.clones[i].targetPosition, this.gameConfig.userOffset);
							this.users[userData.objectID].clones[j].size = userData.clones[i].size;

							this.users[userData.objectID].clones[j].direction = userData.clones[i].direction;
							this.users[userData.objectID].clones[j].rotateSpeed = userData.clones[i].rotateSpeed;
							this.users[userData.objectID].clones[j].maxSpeed = userData.clones[i].maxSpeed;

							this.users[userData.objectID].clones[j].setCenter();
							this.users[userData.objectID].clones[j].setTargetDirection();
							this.users[userData.objectID].clones[j].setSpeed();
						}
					}
				}else{
					console.log('make Clone');
					this.users[userData.objectID].makeClone(userData.clones[i])
				}

				// var cloneInstance = new User(userData.clones[i], this.gameConfig);
				// cloneInstance.position = util.worldToLocalPosition(userData.clones[i].position, this.gameConfig.userOffset);
				// cloneInstance.targetPosition = util.worldToLocalPosition(userData.clones[i].targetPosition, this.gameConfig.userOffset);
				//
				// cloneInstance.direction = userData.clones[i].direction;
				// cloneInstance.rotateSpeed = userData.clones[i].rotateSpeed;
				//
				// cloneInstance.setCenter();
				// cloneInstance.setTargetDirection();
				// cloneInstance.setSpeed();
				//
				// this.users[userData.objectID].clones.push(cloneInstance);
			}
		}else{
  		console.log('can`t find user data');
		}
	},
	checkUserAtUsers : function(userData){
		if(userData.objectID in this.users){
			return true;
		}else{
			return false;
		}
	},
	//will be merge to updateUser function
	moveUser : function(userData){
		if(this.checkUserAtUsers(userData)){
			// console.log(userData);
			// console.log(this.users[userData.objectID]);
			// this.users[userData.objectID].position = util.worldToLocalPosition(userData.position, this.gameConfig.userOffset);
			// this.users[userData.objectID].targetPosition = util.worldToLocalPosition(userData.targetPosition, this.gameConfig.userOffset);
			//
			// // this.users[userData.objectID].speed.x = userData.speed.x;
			// // this.users[userData.objectID].speed.y = userData.speed.y;
			//
			// this.users[userData.objectID].direction = userData.direction;
			// this.users[userData.objectID].rotateSpeed = userData.rotateSpeed;
			// // this.users[userData.objectID].targetDirection = userData.targetDirection;
			//
			// this.users[userData.objectID].setCenter();
			// this.users[userData.objectID].setTargetDirection();
			// this.users[userData.objectID].setSpeed();

			if(this.user.objectID == userData.objectID){
				//offset targetPosition change >> targetPosition == position
				console.log(this.users[userData.objectID]);
				this.users[userData.objectID].changeState(this.gameConfig.OBJECT_STATE_MOVE_OFFSET);
			}else{
				this.users[userData.objectID].changeState(userData.currentState);
			}
		}else{
  		console.log('can`t find user data');
		}
	},
	moveClone : function(userData){
		if(this.checkUserAtUsers(userData)){
			for(var i=0; i<Object.keys(this.users[userData.objectID].clones).length; i++){
				console.log(this.users[userData.objectID].clones[i].targetPosition);
				this.users[userData.objectID].clones[i].changeState(this.gameConfig.OBJECT_STATE_MOVE);
			}
		}else{
			console.log('can`t find user data');
		}
	},
	//execute every frame this client user move
	moveOffset : function(){
		for(var index in this.users){
			if(this.checkUserAtUsers(this.users[index])){
				if(this.users[index] !== this.user){
					this.users[index].position.x -= this.user.speed.x;
					this.users[index].position.y -= this.user.speed.y;

					this.users[index].center.x -= this.user.speed.x;
					this.users[index].center.y -= this.user.speed.y;

					this.users[index].targetPosition.x -= this.user.speed.x;
					this.users[index].targetPosition.y -= this.user.speed.y;

					for(var i=0; i<Object.keys(this.users[index].clones).length; i++){
						this.users[index].clones[i].position.x -= this.user.speed.x;
						this.users[index].clones[i].position.y -= this.user.speed.y;

						this.users[index].clones[i].center.x -= this.user.speed.x;
						this.users[index].clones[i].center.y -= this.user.speed.y;

						this.users[index].clones[i].targetPosition.x -= this.user.speed.x;
						this.users[index].clones[i].targetPosition.y -= this.user.speed.y;
					}
				}
			}else{
				console.log('can`t find user data');
			}
		}
		for(var i=0; i<Object.keys(this.foods).length; i++){
			this.foods[i].position.x -= this.user.speed.x;
			this.foods[i].position.y -= this.user.speed.y;
		}
	},
	revisionUserPos : function(revisionX, revisionY){
		for(var index in this.users){
			if(this.checkUserAtUsers(this.users[index])){
				if(this.users[index] !== this.user){
					this.users[index].addPosAndTargetPos(revisionX, revisionY);
				}
			}
		}
		for(var i=0; i<Object.keys(this.foods).length; i++){
			this.foods[i].position.x += revisionX;
			this.foods[i].position.y += revisionY;
		}
	},
	revisionAllObj : function(revisionX, revisionY){
		for(var index in this.users){
			if(this.checkUserAtUsers(this.users[index])){
				this.users[index].addPosAndTargetPos(revisionX, revisionY);
			}
		}
		for(var i=0; i<Object.keys(this.foods).length; i++){
			this.foods[i].position.x += revisionX;
			this.foods[i].position.y += revisionY;
		}
	},
	// set this client user
	synchronizeUser : function(userID){
		for(var index in this.users){
			if(this.users[index].objectID === userID){
				this.user = this.users[index];
				this.user.onMoveOffset = this.moveOffset.bind(this);
			}
		}
		if(this.user === null){
			console.log('if print me. Something is wrong');
		}
	},
	findUserAsWorldPosition : function(userID, offset){
		for(var index in this.users){
			if(this.users[index].objectID === userID){
				var returnVal = {
					position : util.localToWorldPosition(this.users[index].position, offset),
					size : this.users[index].size
				};
				return returnVal;
			}
		}
	},
	//if canvas size changed re calculate all object local position
	reCalcLocalPosition : function(beforeOffset, afterOffset){
		for(var index in this.users){
			// before local position transform world position[position, targetPosition, center]
			var worldPosition = util.localToWorldPosition(this.users[index].position, beforeOffset);
			var worldTargetPosition = util.localToWorldPosition(this.users[index].targetPosition, beforeOffset);

			this.users[index].position = util.worldToLocalPosition(worldPosition, afterOffset);
			this.users[index].targetPosition = util.worldToLocalPosition(worldTargetPosition, afterOffset);
			this.users[index].setCenter();
		}
	}
};

module.exports = CManager;

},{"../public/util.js":7,"./CClone.js":1,"./CUser.js":4}],4:[function(require,module,exports){
var util = require('../public/util.js');
var LivingEntity = require('./CLivingEntity.js');
var Clone = require('./CClone.js');

var User = function(userData, gameConfig){
  this.objectID = userData.objectID;
  LivingEntity.call(this, userData, gameConfig);

  this.clones = [];
};
User.prototype = Object.create(LivingEntity.prototype);
User.prototype.constructor = User;

User.prototype.makeClone = function(cloneData){
  var thisUser = this;
  var thisClones = this.clones;

  var clone = new Clone(cloneData, this.gameConfig, this.objectID);
  clone.onMoveFindUserAndClones = function(){
    var others = [];
    others.push(thisUser);
    for(var i=0; i<thisClones.length; i++){
      if(thisClones[i].objectID !== clone.objectID){
        others.push(thisClones[i]);
      }
    }
    return others;
  };
  clone.setCenter();
  clone.moveClone();

  this.clones.push(clone);
}

module.exports = User;

},{"../public/util.js":7,"./CClone.js":1,"./CLivingEntity.js":2}],5:[function(require,module,exports){
module.exports={
  "INTERVAL" : 30,

  "CANVAS_MAX_SIZE" : {"width" : 5600 , "height" : 5600},
  "CANVAS_MAX_LOCAL_SIZE" : {"width" : 1600, "height" : 1000},

  "OBJECT_STATE_IDLE" : 0,
  "OBJECT_STATE_MOVE" : 1,

  "FPS" : 60,
  "PLUS_SIZE_WIDTH" : 500,
  "PLUS_SIZE_HEIGHT" : 500,

  "OBJECT_STATE_MOVE_OFFSET" : 99,

  "GAME_STATE_LOAD" : 0,
  "GAME_STATE_START_SCENE" : 1,
  "GAME_STATE_GAME_START" : 2,
  "GAME_STATE_GAME_ON" : 3,
  "GAME_STATE_GAME_END" : 4,

  "FOOD_MIN_COUNT" : 300,
  "FOOD_ADD_PER_USER" : 10,
  "FOOD_MIN_RADIUS" : 20,
  "FOOD_MAX_RADIUS" : 30,
  "FOOD_RANGE_WITH_OTHERS" : 10
}

},{}],6:[function(require,module,exports){
module.exports={
  "USER_BODY_SRC" : "../images/CharBase.svg",
  "USER_BODY_SIZE" : 64,
  "USER_HAND_SRC" : "../images/CharHand.svg",
  "USER_HAND_SIZE" : 64,
  "GRID_SRC" : "../images/map-grass.png",
  "GRID_SIZE" : 60,
  "GRID_IMG_SIZE" : 58
}

},{}],7:[function(require,module,exports){
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

  this.center.x += this.speed.x;
  this.center.y += this.speed.y;
  if(addPos && addPos.x && addPos.y){
    this.position.x += addPos.x;
    this.position.y += addPos.y;

    this.center.x += addPos.x;
    this.center.y += addPos.y;
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

},{"./gameConfig.json":5}],8:[function(require,module,exports){
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

  grid = new Image();
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
    Manager.moveClone(userData);
    console.log(userData);
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
  socket.on('userFusion', function(userData, cloneID){
    Manager.deleteClone(userData.objectID, cloneID);
    Manager.updateUserData(userData);
  });
  socket.on('resSkill', function(userData){
    Manager.updateUserData(userData);
    console.log(userData.clones);
    Manager.moveClone(userData);
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

    //draw clones
    for(var i=0; i<Object.keys(Manager.users[index].clones).length; i++){
      ctx.beginPath();
      ctx.fillStyle = '#aaaaaa';
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 5;
      ctx.arc(Manager.users[index].clones[i].center.x, Manager.users[index].clones[i].center.y, Manager.users[index].clones[i].size.width/2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fill();
      ctx.closePath();
    }
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
    if(keyCode === 32){
      socket.emit('reqSkill');
    }
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

},{"../../modules/client/CManager.js":3,"../../modules/client/CUser.js":4,"../../modules/public/gameConfig.json":5,"../../modules/public/resource.json":6,"../../modules/public/util.js":7}]},{},[8]);

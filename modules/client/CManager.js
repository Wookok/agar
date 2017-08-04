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

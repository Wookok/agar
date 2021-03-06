var User = require('./CUser.js');
var util = require('../public/util.js');

var CManager = function(){
	//all users
	this.users = [];
	this.foods = [];
	this.viruses = [];
};

CManager.prototype = {
	clearGame : function(){
		this.users = [];
		this.foods = [];
		this.viruses = [];
	},
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
		if(userData.objectID in this.users){
			this.users[userData.objectID].position = userData.position;
			this.users[userData.objectID].size = userData.size;
			this.users[userData.objectID].mass = userData.mass;
			this.users[userData.objectID].clones = [];
			for(var i=0; i<Object.keys(userData.clones).length; i++){
				this.users[userData.objectID].clones.push({
					objectID : userData.clones[i].objectID,
					position : userData.clones[i].position,
					mass : userData.clones[i].mass,
					size : userData.clones[i].size
				});
			}
		}
	}
};

module.exports = CManager;

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

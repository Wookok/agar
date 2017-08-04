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

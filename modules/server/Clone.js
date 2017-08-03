var util = require('../public/util.js');
var gameConfig = require('../public/gameConfig.json');
var SUtil = require('./ServerUtil.js');
var serverConfig = require('./serverConfig.json');
var LivingEntity = require('./LivingEntity.js');

function Clone(base, id, maxSpeed, targetPosition, mass, radius){
  LivingEntity.call(this);
  this.startTime = Date.now();

  this.objectID = id;
  this.userID = base.objectID;
  this.position.x = base.position.x;
  this.position.y = base.position.y;

  this.direction = base.direction;
  this.rotateSpeed = base.rotateSpeed;
  this.targetDirection = base.direction;

  this.mass = mass;
  this.setSize(radius * 2, radius * 2);

  this.setMaxSpeed(maxSpeed);
  this.targetPosition = targetPosition;

  this.onMoveFindUserAndClones = new Function();
};
Clone.prototype = Object.create(LivingEntity.prototype);
Clone.prototype.constructor = Clone;

Clone.prototype.addMass = function(mass){
  this.mass += mass;
  var radius = SUtil.massToRadius(this.mass);
  this.setSize(radius * 2, radius * 2);
  this.setCenter();
}
Clone.prototype.moveClone = function(){
  this.setSpeed();
  this.changeState(gameConfig.OBJECT_STATE_MOVE);
};
Clone.prototype.checkChangeAble = function(){
  return Date.now() - this.startTime > serverConfig.cloneChangeableTime * 1000;
};
Clone.prototype.setCloneEle = function(){
  this.userTreeEle = {
    x : this.position.x,
    y : this.position.y,
    width : this.size.width,
    height : this.size.height,
    id : this.userID,
    cloneID : this.objectID
  };
};
Clone.prototype.move = function(){
  var addPos = {x : 0, y : 0};
  //find user and other clones
  var others = this.onMoveFindUserAndClones();
  //check distance with others
  var collisionObjs = [];
  for(var i=0; i<others.length; i++){
    var vecX = this.center.x - others[i].center.x;
    var vecY = this.center.y - others[i].center.y;

    var dist = Math.sqrt(Math.pow(vecX, 2) + Math.pow(vecY, 2));
    if(dist < Math.abs(this.size.width/2 + others[i].size.width/2)){
      var distDiff = this.size.width/2 + others[i].size.width/2 - dist;
      var ratioXYSqure = Math.pow(vecY/vecX, 2);
      var distFactorX = distDiff * Math.sqrt(1/(1 + ratioXYSqure));
      var distFactorY = distDiff * Math.sqrt((ratioXYSqure)/(1 + ratioXYSqure));

      addPos.x += (vecX > 0 ? 1 : -1) * distFactorX;
      addPos.y += (vecY > 0 ? 1 : -1) * distFactorY;
    }
  }
  //if collision calculate distance
  util.move.call(this, addPos);
};
module.exports = Clone;
// Clone.prototype.setTargetPositionAndInitMaxSpeed = function(targetPosition, maxSpeed){
//   if(Date.now() - this.startTime > serverConfig.cloneTargetChangeableTime * 1000){
//     this.targetPosition = targetPosition;
//     this.setMaxSpeed(maxSpeed);
//   }
// };

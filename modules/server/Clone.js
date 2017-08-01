var LivingEntity = require('./LivingEntity.js');
var gameConfig = require('../public/gameConfig.json');
var serverConfig = require('./serverConfig.json');

function Clone(base, maxSpeed, targetPosition, mass, radius){
  LivingEntity.call(this);
  this.startTime = Date.now();

  this.objectID = base.objectID;
  this.position.x = base.position.x;
  this.position.y = base.position.y;

  this.direction = base.direction;
  this.rotateSpeed = base.rotateSpeed;
  this.targetDirection = base.direction;

  this.mass = mass;
  this.setSize(radius * 2, radius * 2);

  this.setMaxSpeed(maxSpeed);
  this.targetPosition = targetPosition;
};
Clone.prototype = Object.create(LivingEntity.prototype);
Clone.prototype.constructor = Clone;

Clone.prototype.moveClone = function(){
  this.setSpeed();
  this.changeState(gameConfig.OBJECT_STATE_MOVE);
};
Clone.prototype.checkChangeAble = function(){
  return Date.now() - this.startTime > serverConfig.cloneChangeableTime * 1000;
};

module.exports = Clone;
// Clone.prototype.setTargetPositionAndInitMaxSpeed = function(targetPosition, maxSpeed){
//   if(Date.now() - this.startTime > serverConfig.cloneTargetChangeableTime * 1000){
//     this.targetPosition = targetPosition;
//     this.setMaxSpeed(maxSpeed);
//   }
// };

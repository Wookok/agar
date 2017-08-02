var User = require('./User.js');
var gameConfig = require('../public/gameConfig.json');
var serverConfig = require('./serverConfig.json');

function Clone(base, id, maxSpeed, targetPosition, mass, radius){
  User.call(this);
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
};
Clone.prototype = Object.create(User.prototype);
Clone.prototype.constructor = Clone;

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

module.exports = Clone;
// Clone.prototype.setTargetPositionAndInitMaxSpeed = function(targetPosition, maxSpeed){
//   if(Date.now() - this.startTime > serverConfig.cloneTargetChangeableTime * 1000){
//     this.targetPosition = targetPosition;
//     this.setMaxSpeed(maxSpeed);
//   }
// };

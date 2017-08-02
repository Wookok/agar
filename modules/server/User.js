var LivingEntity = require('./LivingEntity.js');
var SUtil = require('./ServerUtil.js');
var Clone = require('./Clone.js');
var serverConfig = require('./serverConfig.json');

function User(id){
  LivingEntity.call(this);

  this.clones = [];
  this.cloneTimeout = [];

  this.mass = 100;
  this.socketID = id;
};
User.prototype = Object.create(LivingEntity.prototype);
User.prototype.constructor = User;

User.prototype.addMass = function(mass){
  this.mass += mass;
  var radius = SUtil.massToRadius(this.mass);
  this.setSize(radius * 2, radius * 2);
  this.setCenter();
  return this.size.width/2;
};
User.prototype.changeMass = function(){
  this.mass = this.mass/2;
  var radius = SUtil.massToRadius(this.mass);
  this.setSize(radius * 2, radius * 2);
  this.setCenter();
}
//clone
User.prototype.makeClone = function(cloneID){
  var cloneMaxSpeed = SUtil.calcCloneSpeed(this.maxSpeed);
  var targetPosition = SUtil.calcCloneTargetPosition(this.position, this.direction, cloneMaxSpeed);
  var cloneMass = this.mass/2;
  this.changeMass();
  var radius = SUtil.massToRadius(cloneMass);
  var clone = new Clone(this, cloneID, cloneMaxSpeed, targetPosition, cloneMass, radius);
  clone.setCenter();
  clone.moveClone();
  var thisUser = this;
  // var timeout = setTimeout(function(){
  //   clone.setMaxSpeed(thisUser.maxSpeed);
  //   clone.setTargetPosition(thisUser.position);
  //   clone.setTargetDirection();
  //   clone.setSpeed();
  //   clone.changeState(thisUser.gameConfig.OBJECT_STATE_MOVE);
  // }, serverConfig.cloneChangeableTime * 1000);
  // this.cloneTimeout.push(timeout);
  setTimeout(function(){

  }, serverConfig.cloneLifeTime * 1000);
  this.clones.push(clone);
  // console.log(this.clones);
};
User.prototype.clonesSetting = function(){
  for(var i=0; i<Object.keys(this.clones).length; i++){
    if(this.clones[i].checkChangeAble()){
      this.clones[i].targetPosition = this.targetPosition;
      // this.clones[i].setTargetPosition(this.targetPosition);
      this.clones[i].setMaxSpeed(this.maxSpeed);
      this.clones[i].setTargetDirection();
      this.clones[i].setSpeed();
    }
    // this.clones[i].setTargetPositionAndInitMaxSpeed(this.targetPosition, this.maxSpeed);
  }
};
User.prototype.clonesChangeState = function(newState){
  for(var i=0; i<Object.keys(this.clones).length; i++){
    if(this.clones[i].checkChangeAble()){
      this.clones[i].changeState(newState);
    }
  }
};

module.exports = User;

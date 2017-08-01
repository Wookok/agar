var LivingEntity = require('./LivingEntity.js');
var SUtil = require('./ServerUtil.js');
var Clone = require('./Clone.js');

function User(id){
  LivingEntity.call(this);

  this.clones = [];

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
User.prototype.makeClone = function(){
  var cloneMaxSpeed = SUtil.calcCloneSpeed(this.maxSpeed);
  var targetPosition = SUtil.calcCloneTargetPosition(this.direction, cloneMaxSpeed);
  var cloneMass = this.mass/2;
  this.changeMass();
  var radius = SUtil.massToRadius(cloneMass);
  var clone = new Clone(this, cloneMaxSpeed, targetPosition, cloneMass, radius);
  clone.setCenter();
  clone.moveClone();
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

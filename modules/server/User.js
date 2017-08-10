var LivingEntity = require('./LivingEntity.js');
var SUtil = require('./ServerUtil.js');
var Clone = require('./Clone.js');
var serverConfig = require('./serverConfig.json');

function User(id){
  LivingEntity.call(this);

  this.clones = [];
  this.cloneTimeout = [];

  this.mass = 0;
  this.socketID = id;

  this.onDestroy = new Function();
};
User.prototype = Object.create(LivingEntity.prototype);
User.prototype.constructor = User;

User.prototype.setMass = function(mass){
  this.mass = mass;
  var radius = SUtil.massToRadius(this.mass);
  this.setSize(radius * 2, radius * 2);
  this.setCenter();
};
User.prototype.addMass = function(mass){
  this.mass += mass;
  var radius = SUtil.massToRadius(this.mass);
  this.setSize(radius * 2, radius * 2);
  this.setCenter();
  return this.size.width/2;
};
User.prototype.divideMass = function(){
  this.mass = this.mass/2;
  var radius = SUtil.massToRadius(this.mass);
  this.setSize(radius * 2, radius * 2);
  this.setCenter();
};
User.prototype.destroy = function(){
  if(this.clones.length === 0){
    this.onDestroy();
  }else{
    console.log('change to clone');
  }
};
//clone
User.prototype.makeClone = function(cloneID){
  if(SUtil.checkToCloneable(this.mass)){
    var cloneMaxSpeed = SUtil.calcCloneSpeed(this.maxSpeed);
    var targetPosition = SUtil.calcCloneTargetPosition(this.position, this.direction, cloneMaxSpeed);
    var cloneMass = this.mass/2;
    this.divideMass();
    var radius = SUtil.massToRadius(cloneMass);
    var clone = new Clone(this, this.objectID, cloneID, cloneMaxSpeed, targetPosition, cloneMass, radius);

    var thisClones = this.clones;
    var thisUser = this;

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
    clone.onFusion = function(){
      thisUser.addMass(clone.mass);
      var index = thisClones.indexOf(clone);
      if(index !== -1){
        thisClones.splice(index, 1);
      }
    };
    clone.onDestroy = function(){
      var index = thisClones.indexOf(clone);
      if(index !== -1){
        thisClones.splice(index, 1);
      }
    }
    clone.setCenter();
    clone.moveClone();

    for(var i=this.clones.length; i>0; i--){
      if(SUtil.checkToCloneable(this.clones[i - 1].mass)){
        var clonesCloneID = SUtil.generateRandomUniqueID('C', this.clones);
        var clonesCloneMaxSpeed = SUtil.calcCloneSpeed(this.clones[i - 1].maxSpeed);
        var clonesTargetPosition = SUtil.calcCloneTargetPosition(this.clones[i - 1].position, this.clones[i - 1].direction, clonesCloneMaxSpeed);
        var clonesCloneMass = this.clones[i - 1].mass/2;
        this.clones[i - 1].divideMass();
        var clonesRadius = SUtil.massToRadius(clonesCloneMass);
        var clonesClone = new Clone(this.clones[i - 1], this.objectID, clonesCloneID, clonesCloneMaxSpeed, clonesTargetPosition, clonesCloneMass, clonesRadius);

        clonesClone.onMoveFindUserAndClones = function(){
          var others = [];
          others.push(thisUser);
          for(var i=0; i<thisClones.length; i++){
            if(thisClones[i].objectID !== clonesClone.objectID){
              others.push(thisClones[i]);
            }
          }
          return others;
        };
        clonesClone.onFusion = function(){
          thisUser.addMass(clonesClone.mass);
          var index = thisClones.indexOf(clonesClone);
          if(index !== -1){
            thisClones.splice(index, 1);
          }
        };
        clonesClone.setCenter();
        clonesClone.moveClone();
        this.clones.push(clonesClone);
      }
    }
    this.clones.push(clone);
  }
};
User.prototype.makeOnlyUserClone = function(){
  var cloneID = SUtil.generateRandomUniqueID('C', this.clones);
  var cloneMaxSpeed = SUtil.calcCloneSpeed(this.maxSpeed);
  var targetPosition = SUtil.calcCloneTargetPosition(this.position, this.direction, cloneMaxSpeed);
  var cloneMass = this.mass/2;
  this.divideMass();
  var radius = SUtil.massToRadius(cloneMass);
  var clone = new Clone(this, this.objectID, cloneID, cloneMaxSpeed, targetPosition, cloneMass, radius);

  var thisClones = this.clones;
  var thisUser = this;

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
  clone.onFusion = function(){
    thisUser.addMass(clone.mass);
    var index = thisClones.indexOf(clone);
    if(index !== -1){
      thisClones.splice(index, 1);
    }
  };
  clone.onDestroy = function(){
    var index = thisClones.indexOf(clone);
    if(index !== -1){
      thisClones.splice(index, 1);
    }
  }
  clone.setCenter();
  clone.moveClone();
  this.clones.push(clone);
};
User.prototype.makeOnlyClonesClone = function(cloneID){
  for(var i=0; i<this.clones.length; i++){
    if(cloneID === this.clones[i].objectID){
      var index = i;
      break;
    }
  }
  if(index !== undefined && index !== -1){
    var thisClones = this.clones;
    var thisUser = this;

    var clonesCloneID = SUtil.generateRandomUniqueID('C', this.clones);
    var clonesCloneMaxSpeed = SUtil.calcCloneSpeed(this.clones[index].maxSpeed);
    var clonesTargetPosition = SUtil.calcCloneTargetPosition(this.clones[index].position, this.clones[index].direction, clonesCloneMaxSpeed);
    var clonesCloneMass = this.clones[index].mass/2;
    this.clones[index].divideMass();
    var clonesRadius = SUtil.massToRadius(clonesCloneMass);
    var clonesClone = new Clone(this.clones[index], this.objectID, clonesCloneID, clonesCloneMaxSpeed, clonesTargetPosition, clonesCloneMass, clonesRadius);

    clonesClone.onMoveFindUserAndClones = function(){
      var others = [];
      others.push(thisUser);
      for(var i=0; i<thisClones.length; i++){
        if(thisClones[i].objectID !== clonesClone.objectID){
          others.push(thisClones[i]);
        }
      }
      return others;
    };
    clonesClone.onFusion = function(){
      thisUser.addMass(clonesClone.mass);
      var index = thisClones.indexOf(clonesClone);
      if(index !== -1){
        thisClones.splice(index, 1);
      }
    };
    clonesClone.setCenter();
    clonesClone.moveClone();
    this.clones.push(clonesClone);
  }
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

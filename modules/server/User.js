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

  this.onFusion = new Function();
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

//clone
User.prototype.makeClone = function(cloneID){
  if(this.mass >= serverConfig.cloneableMass){
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
      thisUser.onFusion(thisUser, clone.objectID);
    };
    clone.setCenter();
    clone.moveClone();

    for(var i=this.clones.length; i>0; i--){
      if(this.clones[i - 1].mass >= serverConfig.cloneableMass){
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
          thisUser.onFusion(thisUser, clone.objectID);
        };
        clonesClone.setCenter();
        clonesClone.moveClone();
        this.clones.push(clonesClone);
      }
    }
    this.clones.push(clone);
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

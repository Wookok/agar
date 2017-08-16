var util = require('../public/util.js');
var gameConfig = require('../public/gameConfig.json');
var SUtil = require('./ServerUtil.js');
var serverConfig = require('./serverConfig.json');
var LivingEntity = require('./LivingEntity.js');

function Clone(base, userID, id, maxSpeed, targetPosition, mass, radius){
  LivingEntity.call(this);
  this.startTime = Date.now();

  this.objectID = id;
  this.userID = userID;
  this.position.x = base.position.x;
  this.position.y = base.position.y;
  this.direction = base.direction;
  this.rotateSpeed = base.rotateSpeed;
  this.targetDirection = base.direction;

  this.mass = mass;
  this.setSize(radius * 2, radius * 2);
  this.setMaxSpeed(maxSpeed);
  this.targetPosition = targetPosition;

  this.onFusion = new Function();
  this.onDestroy = new Function();
  this.onMoveFindUserAndClones = new Function();
};
Clone.prototype = Object.create(LivingEntity.prototype);
Clone.prototype.constructor = Clone;

Clone.prototype.addMass = function(mass){
  this.mass += mass;
  var radius = SUtil.massToRadius(this.mass);
  this.setSize(radius * 2, radius * 2);
  this.setCenter();
  if(this.checkChangeAble()){
    var maxSpeed = SUtil.massToSpeed(this.mass);
    this.setMaxSpeed(maxSpeed);
  }
};
Clone.prototype.moveClone = function(){
  this.setSpeed();
  this.position.x += this.speed.x;
  this.position.y += this.speed.y;
  this.changeState(gameConfig.OBJECT_STATE_MOVE);
};
Clone.prototype.checkChangeAble = function(){
  return Date.now() - this.startTime > serverConfig.cloneChangeableTime * 1000;
};
Clone.prototype.checkDoFusion = function(){
  return Date.now() - this.startTime > serverConfig.cloneFusionTime * 1000;
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
Clone.prototype.destroy = function(){
  this.onDestroy();
};
Clone.prototype.fusion = function(){
  this.stop();
  this.onFusion();
};
Clone.prototype.move = function(){
  var addPos = {x : 0, y : 0};
  if(this.checkChangeAble()){
    //find user and other clones
    var others = this.onMoveFindUserAndClones();
    //check distance with others
    for(var i=0; i<others.length; i++){
      var vecX = this.center.x - others[i].center.x;
      var vecY = this.center.y - others[i].center.y;

      var dist = Math.sqrt(Math.pow(vecX, 2) + Math.pow(vecY, 2));
      if(dist < Math.abs(this.size.width/2 + others[i].size.width/2)){
        if(this.checkDoFusion()){
          this.fusion();
        }else{
          if(vecX === 0 && vecY === 0){
            var distFactorX = 1;
            var distFactorY = 1;
            addPos.x += this.speed.x / 10;
            addPos.y += this.speed.y / 10;
          }else if(vecX === 0){
            distFactorX = 1;
            distFactorY = 0;
            addPos.x += this.speed.x / 10;
          }else if(vecY === 0){
            distFactorX = 0;
            distFactorY = 1;
            addPos.y += this.speed.y / 10;
          }else{
            var distDiff = this.size.width/2 + others[i].size.width/2 - dist;
            ratioXYSqure = Math.pow(vecY/vecX, 2);
            distFactorX = distDiff * Math.sqrt(1/(1 + ratioXYSqure));
            distFactorY = distDiff * Math.sqrt((ratioXYSqure)/(1 + ratioXYSqure));
          }

          addPos.x += (vecX >= 0 ? 1 : -1) * distFactorX / 10;
          addPos.y += (vecY >= 0 ? 1 : -1) * distFactorY / 10;
        }
      }
    }
  }
  //if collision calculate distance
  util.move.call(this, addPos);
  if(addPos.x !== 0|| addPos.y !==0){
    this.setSpeed();
  }
};
Clone.prototype.divideMass = function(){
  this.mass = this.mass/2;
  var radius = SUtil.massToRadius(this.mass);
  this.setSize(radius * 2, radius * 2);
  this.setCenter();
  if(this.checkChangeAble()){
    var maxSpeed = SUtil.massToSpeed(this.mass);
    this.setMaxSpeed(maxSpeed);
  }
};
module.exports = Clone;
// Clone.prototype.setTargetPositionAndInitMaxSpeed = function(targetPosition, maxSpeed){
//   if(Date.now() - this.startTime > serverConfig.cloneTargetChangeableTime * 1000){
//     this.targetPosition = targetPosition;
//     this.setMaxSpeed(maxSpeed);
//   }
// };

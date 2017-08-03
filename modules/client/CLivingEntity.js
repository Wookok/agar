var util = require('../public/util.js');

var LivingEntity = function(entityData, gameConfig){
  this.gameConfig = gameConfig;

  this.currentState = null;
  this.size = entityData.size;

  this.position = util.worldToLocalPosition(entityData.position, this.gameConfig.userOffset);
  this.targetPosition = util.worldToLocalPosition(entityData.targetPosition, this.gameConfig.userOffset);
  this.direction = entityData.direction;
  this.rotateSpeed = entityData.rotateSpeed;

  this.maxSpeed = entityData.maxSpeed;

  this.center = {x : 0, y : 0};
  this.speed = {x : 0, y : 0};
  this.targetDirection = 0;

  this.setCenter();
  this.setSpeed();
  this.setTargetDirection();

  this.updateInterval = false;
  this.updateFunction = null;

  this.onMoveOffset = null;
};
LivingEntity.prototype = {
  changeState : function(newState){

    this.currentState = newState;

    this.stop();
    switch (this.currentState) {
      case this.gameConfig.OBJECT_STATE_IDLE:
        this.updateFunction = null;
        break;
      case this.gameConfig.OBJECT_STATE_MOVE:
        this.updateFunction = this.rotate.bind(this);
        break;
      case this.gameConfig.OBJECT_STATE_MOVE_OFFSET:
        this.updateFunction = this.rotate.bind(this);
        break;
    }
    this.update();
  },
  update : function(){
    var INTERVAL_TIMER = Math.floor(1000/this.gameConfig.INTERVAL);
    this.updateInterval = setInterval(this.updateFunction, INTERVAL_TIMER);
  },
  setCenter : function(){
    this.center.x = this.position.x + this.size.width/2,
    this.center.y = this.position.y + this.size.height/2
  },
  setSize : function(radius){
    this.size.width = radius * 2;
    this.size.height = radius * 2;
    this.setCenter();
  },
  rotate : function(){
    util.rotate.call(this);
  },
  move : function(){
    util.move.call(this);
  },
  setTargetDirection : function(){
    util.setTargetDirection.call(this);
  },
  setSpeed : function(){
    util.setSpeed.call(this);
  },
  moveOffset : function(){
    var distX = this.targetPosition.x - this.center.x;
    var distY = this.targetPosition.y - this.center.y;

    if(distX == 0 && distY == 0){
      this.stop();
      this.changeState(this.gameConfig.OBJECT_STATE_IDLE);
    }
    if(Math.abs(distX) < Math.abs(this.speed.x)){
      this.speed.x = distX;
    }
    if(Math.abs(distY) < Math.abs(this.speed.y)){
      this.speed.y = distY;
    }
    this.targetPosition.x -= this.speed.x;
    this.targetPosition.y -= this.speed.y;

    this.gameConfig.userOffset.x += this.speed.x;
    this.gameConfig.userOffset.y += this.speed.y;

    for(var i=0; i<Object.keys(this.clones).length; i++){
      this.clones[i].targetPosition.x -= this.clones[i].speed.x;
      this.clones[i].targetPosition.y -= this.clones[i].speed.y;

      this.clones[i].center.x -= this.clones[i].speed.x;
      this.clones[i].center.y -= this.clones[i].speed.y;

      this.clones[i].position.x -= this.clones[i].speed.x;
      this.clones[i].position.y -= this.clones[i].speed.y
    }
    this.onMoveOffset();
  },
  addPosAndTargetPos : function(addPosX , addPosY){
    this.position.x += addPosX;
    this.position.y += addPosY;

    this.targetPosition.x += addPosX;
    this.targetPosition.y += addPosY;

    this.setCenter();
  },
  stop : function(){
    if(this.updateInterval){
      clearInterval(this.updateInterval);
      this.updateInterval = false;
    }
  }
};

module.exports = LivingEntity;
var gameConfig = require('./gameConfig.json');

//must use with bind or call method
exports.rotate = function(){
  // console.log(this);
  if(this.targetDirection === this.direction){
    if(this.currentState === gameConfig.OBJECT_STATE_MOVE){
      this.move();
    }
  }
  //check rotate direction
  else if(this.direction > 0 && this.targetDirection < 0){
    if((180 - this.direction + 180 + this.targetDirection) < (this.direction - this.targetDirection)){
      if(Math.abs(this.targetDirection - this.direction)<this.rotateSpeed){
        this.direction += Math.abs(this.targetDirection - this.direction);
      }else{
        this.direction += this.rotateSpeed;
      }
    }else if(this.targetDirection < this.direction){
      if(Math.abs(this.targetDirection - this.direction)<this.rotateSpeed){
        this.direction -= Math.abs(this.targetDirection - this.direction);
      }else{
        this.direction -= this.rotateSpeed;
      }
    }
  }else if(this.direction < 0 && this.targetDirection >0 ){
    if((180 + this.direction + 180 - this.targetDirection) < (this.targetDirection - this.direction)){
      if(Math.abs(this.targetDirection - this.direction)<this.rotateSpeed){
        this.direction -= Math.abs(this.targetDirection - this.direction);
      }else{
        this.direction -= this.rotateSpeed;
      }
    }else if(this.targetDirection > this.direction){
      if(Math.abs(this.targetDirection - this.direction)<this.rotateSpeed){
        this.direction += Math.abs(this.targetDirection - this.direction);
      }else{
        this.direction += this.rotateSpeed;
      }
    }
  }else if(this.targetDirection > this.direction){
    if(Math.abs(this.targetDirection - this.direction)<this.rotateSpeed){
      this.direction += Math.abs(this.targetDirection - this.direction);
    }else{
      this.direction += this.rotateSpeed;
    }
  }else if(this.targetDirection < this.direction){
    if(Math.abs(this.targetDirection - this.direction)<this.rotateSpeed){
      this.direction -= Math.abs(this.targetDirection - this.direction);
    }else{
      this.direction -= this.rotateSpeed;
    }
  }

  if(this.direction >= 180){
    this.direction -= 360;
  }else if(this.direction <= -180){
    this.direction += 360;
  }
};
exports.checkNameIsValid = function(name){
  name.replace(/(<([^>]+)>)/ig, '').substring(0,25);
  var expression = /^\w*$/;
  return expression.exec(name);
};
//must use with bind or call method
exports.move = function(addPos){
  //calculate dist with target
  var distX = this.targetPosition.x - this.center.x;
  var distY = this.targetPosition.y - this.center.y;

  if(distX == 0 && distY == 0){
    this.stop();
    this.changeState(gameConfig.OBJECT_STATE_IDLE);
  }
  if(Math.abs(distX) < Math.abs(this.speed.x)){
    this.speed.x = distX;
  }
  if(Math.abs(distY) < Math.abs(this.speed.y)){
    this.speed.y = distY;
  }
  this.position.x += this.speed.x;
  this.position.y += this.speed.y;

  if(addPos && addPos.x && addPos.y){
    this.position.x += addPos.x;
    this.position.y += addPos.y;
  }

  if(this.position.x < 0){
    this.position.x = 0;
  }else if(this.position.x > gameConfig.CANVAS_MAX_SIZE.width - this.size.width){
    this.position.x = gameConfig.CANVAS_MAX_SIZE.width - this.size.width;
  }
  if(this.position.y < 0){
    this.position.y = 0;
  }else if(this.position.y > gameConfig.CANVAS_MAX_SIZE.height - this.size.height){
    this.position.y = gameConfig.CANVAS_MAX_SIZE.height - this.size.height;
  }
  // if(this.center.x < this.size.width/2){
  //   this.center.x = this.size.width/2;
  // }else if(this.center.x > gameConfig.CANVAS_MAX_SIZE.width + this.size.width/2){
  //   this.center.x = gameConfig.CANVAS_MAX_SIZE.width + this.size.width/2;
  // }
  // if(this.center.y < this.size.height/2){
  //   this.center.y = this.size.height/2;
  // }else if(this.center.y > gameConfig.CANVAS_MAX_SIZE.height + this.size.height/2){
  //   this.center.y = gameConfig.CANVAS_MAX_SIZE.height + this.size.height/2;
  // }

  this.setCenter();
};

//must use with bind or call method
//setup when click canvas for move
exports.setSpeed = function(){
  var distX = this.targetPosition.x - this.center.x;
  var distY = this.targetPosition.y - this.center.y;

  if(distX == 0  && distY ==0){
    this.speed.x = 0;
    this.speed.y = 0;
  }else if(Math.pow(distX,2) + Math.pow(distY,2) < 100){
    this.speed.x = distX;
    this.speed.y = distY;
  }else{
    this.speed.x = (distX>=0?1:-1)*Math.sqrt(Math.pow(this.maxSpeed,2)*Math.pow(distX,2)/(Math.pow(distX,2)+Math.pow(distY,2)));
    this.speed.y = (distY>=0?1:-1)*Math.sqrt(Math.pow(this.maxSpeed,2)*Math.pow(distY,2)/(Math.pow(distX,2)+Math.pow(distY,2)));
  }
};

//must use with bind or call method
// setup when click canvas for move or fire skill
exports.setTargetDirection = function(){
  var distX = this.targetPosition.x - this.center.x;
  var distY = this.targetPosition.y - this.center.y;

  var tangentDegree = Math.atan(distY/distX) * 180 / Math.PI;
  if(distX < 0 && distY >= 0){
    this.targetDirection = tangentDegree + 180;
  }else if(distX < 0 && distY < 0){
    this.targetDirection = tangentDegree - 180;
  }else{
    this.targetDirection = tangentDegree;
  }
};

//check obstacle collision
exports.checkCircleCollision = function(tree, posX, posY, radius, id){
  var returnVal = [];
  var obj = {x : posX, y: posY, width:radius * 2, height: radius * 2, id: id};
  tree.onCollision(obj, function(item){
    if(obj.id !== item.id){
      var objCenterX = obj.x + obj.width/2;
      var objCenterY = obj.y + obj.height/2;

      var itemCenterX = item.x + item.width/2;
      var itemCenterY = item.y + item.height/2;

      // check sum of radius with item`s distance
      var distSquareDiff = Math.pow(obj.width/2 + item.width/2,2) - Math.pow(itemCenterX - objCenterX,2) - Math.pow(itemCenterY - objCenterY,2);
      if(distSquareDiff > 0 ){
        //collision occured
        returnVal.push(item);
      }
    }
  });
  return returnVal;
};

//coordinate transform
exports.localToWorldPosition = function(position, offset){
  var newPosition = {
    x : position.x + offset.x,
    y : position.y + offset.y
  };
  return newPosition;
};
exports.worldToLocalPosition = function(position, offset){
  var newPosition = {
    x : position.x - offset.x,
    y : position.y - offset.y
  };
  return newPosition;
};
exports.worldXCoordToLocalX = function(x, offsetX){
  return x - offsetX;
};
exports.worldYCoordToLocalY = function(y, offsetY){
  return y - offsetY;
};
exports.isDrawX = function(x, gameConfig){
  if(x <= gameConfig.userOffset.x - gameConfig.PLUS_SIZE_WIDTH){
    return false;
  }else if(x >= gameConfig.userOffset.x + gameConfig.canvasSize.width + gameConfig.PLUS_SIZE_WIDTH){
    return false;
  }else{
    return true;
  }
};
exports.isDrawY = function(y, gameConfig){
  if(y <= gameConfig.userOffset.y - gameConfig.PLUS_SIZE_HEIGHT){
    return false;
  }else if(y >= gameConfig.userOffset.y + gameConfig.canvasSize.height + gameConfig.PLUS_SIZE_HEIGHT){
    return false;
  }else{
    return true;
  }
};
exports.calculateOffset = function(user, canvasSize){
  var newOffset = {
    x : user.position.x + user.size.width/2 - canvasSize.width/2,
    y : user.position.y + user.size.height/2 - canvasSize.height/2
  };
  return newOffset;
};
exports.isExistsClone = function(userClones, updateClone){
  for(var i=0; i<userClones.length; i++){
    if(userClones[i].objectID === updateClone.objectID){
      return true;
    }
  }
  return false;
}
exports.isXInCanvas = function(x, gameConfig){
  var scaledX = x * gameConfig.scaleFactor;
  if(scaledX>0 && scaledX<gameConfig.canvasSize.width){
    return true;
  }
  return false;
};
exports.isYInCanvas = function(y, gameConfig){
  var scaledY = y * gameConfig.scaleFactor;
  if(scaledY>0 && scaledY<gameConfig.canvasSize.height){
    return true;
  }
  return false;
};

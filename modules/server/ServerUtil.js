var util = require('../public/util.js');
var gameConfig = require('../public/gameConfig');
var serverConfig = require('./serverConfig.json');

exports.calcCloneSpeed = function(maxSpeed){
  return maxSpeed * serverConfig.cloneSpeedRate;
};
exports.calcCloneTargetPosition = function(position, direction, maxSpeed, radius){
  var unitSpeedX = Math.cos(direction * Math.PI/180) * maxSpeed;
  var unitSpeedY = Math.sin(direction * Math.PI/180) * maxSpeed;
  var targetPosX = position.x + unitSpeedX * serverConfig.cloneChangeableTime * gameConfig.INTERVAL;
  var targetPosY = position.y + unitSpeedY * serverConfig.cloneChangeableTime * gameConfig.INTERVAL;

  if(targetPosX < radius){
    targetPosX = radius;
  }else if(targetPosX > gameConfig.CANVAS_MAX_SIZE.width - radius){
    targetPosX = gameConfig.CANVAS_MAX_SIZE.width - radius;
  }
  if(targetPosY < radius){
    targetPosY = radius;
  }else if(targetPosY > gameConfig.CANVAS_MAX_SIZE.height - radius){
    targetPosY = gameConfig.CANVAS_MAX_SIZE.height - radius;
  }

  return {
    x : targetPosX,
    y : targetPosY
  };
};
exports.massToSpeed = function(mass){
  return serverConfig.minMaxSpeed + serverConfig.baseMaxSpeed / Math.sqrt(mass);
};
exports.massToRadius = function(mass){
  return 4 + Math.sqrt(mass) * 6;
};
exports.radiusToMass = function(radius){
  return Math.pow((radius-4)/6,2);
};
exports.generateRandomRadius = function(minRadius, maxRadius){
  return Math.floor(Math.random()*(maxRadius - minRadius) + minRadius);
};
exports.generateRandomColor = function(){
  var output = "#";
  for(var i=0; i<6; i++){
    output += Math.floor(Math.random()*16).toString(16);
  }
  return output;
};
exports.generateRandomPos = function(checkTree, minX, minY, maxX, maxY, radius, diffRangeWithOthers, objID, checkTree2){
  var isCollision = true;
  while(isCollision){
    isCollision = false;
    var pos = {
      x : Math.floor(Math.random()*(maxX - minX) + minX),
      y : Math.floor(Math.random()*(maxY - minY) + minY)
    }
    var collisionObjs = util.checkCircleCollision(checkTree, pos.x, pos.y, radius + diffRangeWithOthers, objID);
    if(collisionObjs.length > 0){
      isCollision = true;
    }
    if(checkTree2){
      var collisionObjs = util.checkCircleCollision(checkTree2, pos.x, pos.y, radius + diffRangeWithOthers, objID);
      if(collisionObjs.length > 0){
        isCollision = true;
      }
    }
  }
  return pos;
};
exports.checkToCloneable = function(checkMass){
  if(checkMass >= serverConfig.cloneableMass){
    return true;
  }
  return false;
};
exports.generateRandomUniqueID = function(prefix, uniqueCheckArray){
  var IDisUnique = false;
  while(!IDisUnique){
    var randomID = generateRandomID(prefix);
    IDisUnique = true;
    for(var index in uniqueCheckArray){
      if(randomID == uniqueCheckArray[index].objectID){
        IDisUnique = false;
      }
    }
  }
  return randomID;
};
function generateRandomID(prefix){
  var output = prefix;
  for(var i=0; i<6; i++){
    output += Math.floor(Math.random()*16).toString(16);
  }
  return output;
};

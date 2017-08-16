var GameObject = require('./GameObject.js');

function Virus(objectID, position, radius){
  GameObject.call(this);
  this.objectID = objectID;

  this.setSize(radius * 2, radius * 2);
  this.setPosition(position.x, position.y);
  
  this.staticEle = {
    id : this.objectID,
    x : this.position.x,
    y : this.position.y,
    width : this.size.width,
    height : this.size.height
  };
};
Virus.prototype = Object.create(GameObject.prototype);
Virus.prototype.constructor = Virus;

module.exports = Virus;

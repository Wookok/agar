var GameObject = require('./GameObject.js');

function Food(objectID){
  GameObject.call(this);
  this.objectID = objectID;

  this.mass;
  this.color;

  this.staticEle = {};
};
Food.prototype = Object.create(GameObject.prototype);
Food.prototype.constructor = Food;

Food.prototype.initFood = function(position, radius, mass, color){
  this.setSize(radius * 2, radius * 2);
  this.setPosition(position.x, position.y);
  this.mass = mass;
  this.color = color;
};
Food.prototype.setStaticEle = function(){
  this.staticEle.id = this.objectID;
  this.staticEle.x = this.position.x;
  this.staticEle.y = this.position.y;
  this.staticEle.width = this.size.width;
  this.staticEle.height = this.size.height;
  this.staticEle.mass = this.mass;
};

module.exports = Food;

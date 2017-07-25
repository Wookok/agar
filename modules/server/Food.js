function Food(objectID, weight){
  GameObject.call(this);
  this.objectID = objectID;

  this.weight = weight;
};
Food.prototype = Object.create(GameObject.prototype);
Food.prototype.constructor = Food;

module.exports = Food;

var LivingEntity = require('./LivingEntity.js');

function User(id){
  LivingEntity.call(this);

  this.mass;

  this.socketID = id;
};
User.prototype = Object.create(LivingEntity.prototype);
User.prototype.constructor = LivingEntity;

User.prototype.addMass = function(mass){
  this.mass += mass;
  return this.mass;
};

module.exports = User;

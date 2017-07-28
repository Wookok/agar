var LivingEntity = require('./LivingEntity.js');
var SUtil = require('./ServerUtil.js');

function User(id){
  LivingEntity.call(this);

  this.mass = 100;

  this.socketID = id;
};
User.prototype = Object.create(LivingEntity.prototype);
User.prototype.constructor = User;

User.prototype.addMass = function(mass){
  this.mass += mass;
  var radius = SUtil.massToRadius(this.mass);
  this.setSize(radius * 2, radius * 2);
  this.setCenter();
  return this.size.width/2;
};

module.exports = User;

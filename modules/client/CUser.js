var User = function(userData){
  this.objectID = userData.objectID;
  this.name = userData.name;
  this.position = userData.position;
  this.size = userData.size;
  this.mass = userData.mass;
  this.clones = [];
}

module.exports = User;

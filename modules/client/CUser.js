var User = function(userData){
  this.objectID = userData.objectID;
  this.position = userData.position;
  this.size = userData.size;
  this.clones = [];
}

module.exports = User;

function UserManager(validator) {
  this._users = {};
  this._validator = validator || {
    escape: (message) => {return message}
  };
}
UserManager.prototype = {
  addUser: function(socket, username, color) {
    this._users[socket.id] = {
      username: this._validator.escape(username),
      color: color
    };
  },
  removeUser: function(socket) {
    delete this._users[socket.id];
  },
  getUser: function(socket) {
    return this._users[socket.id];
  }
}

module.exports = UserManager;

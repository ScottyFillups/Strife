function PostManager(validator) {
  this._validator = validator || {
    escape: (message) => {return message}
  };
}
PostManager.prototype = {
  _buildPost: function(user, message, type) {
    return {
      type: type,
      username: user.username,
      message: this._validator.escape(message),
      color: user.color,
      time: new Date()
    }
  },
  buildMessage: function(user, message) {
    return this._buildPost(user, message, 'message');
  }, 
  buildLeaveNotification: function(user) {
    return this._buildPost(user, 'has left.', 'notification');
  },
  buildJoinNotification: function(user) {
    return this._buildPost(user, 'has joined.', 'notification');
  }
};

module.exports = PostManager;

const randomPrettyColor = require('randomcolor');
const validator = require('validator');
const postManager = new (require('./PostManager'))();
const UserManager = require('./UserManager');
const herokuPinger = require('heroku-pinger');

function RoomManager(room, url, address, queue, options) {
  options = options || {};
  let cacheSize = options.msgCacheLimit || 100;

  this._pinger = herokuPinger(url);
  this._room = room;
  this._address = address;
  this._userStore = new UserManager(validator);
  this._redisQueue = queue;

  this._room.on('connection', (socket) => {
    socket.on('join room', (data) => {
      this._userJoinHandler(socket, data) });
    socket.on('send message', (data) => {
      this._userMessageHandler(socket, data) });
    socket.on('disconnect', (data) => { 
      this._userLeaveHandler(socket) });
  });
}
RoomManager.prototype = {
  _userJoinHandler: function(socket, username) {
    let userColor = randomPrettyColor();
    this._userStore.addUser(socket, username, userColor);

    let user = this._userStore.getUser(socket);
    let post = postManager.buildJoinNotification(user);

    this._redisQueue.push(this._address, post);
    this._redisQueue.loadAll(this._address, (err, reply) => {
      socket.emit('load messages', reply);
      socket.broadcast.emit('push notification', post);
    });
  },
  _userMessageHandler: function(socket, message) {
    let user = this._userStore.getUser(socket);
    let post = postManager.buildMessage(user, message);
    this._redisQueue.push(this._address, post);
    this._room.emit('push message', post);
    this._pinger.schedulePing();
  },
  _userLeaveHandler: function(socket) {
    let user = this._userStore.getUser(socket);
    if (user) {
      let post = postManager.buildLeaveNotification(user);
      this._redisQueue.push(this._address, post);
      socket.broadcast.emit('push notification', post);
      this._userStore.removeUser(socket);
    }
  },
}

module.exports = RoomManager;

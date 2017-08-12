const RoomManager = require('./RoomManager');
const redisManager = new (require('./RedisManager'))();

function AppManager(io, options) {
  options = options || {};
  this._rooms = {};
  this._io = io;
  this._cacheSize = options.msgCacheLimit || 100;
}
AppManager.prototype = {
  genRoom: function(address) {
    let room = this._io.of('/' + address);
    let queue = redisManager.getQueue(this._cacheSize);
    this._rooms[address] = new RoomManager(room, address, queue);
  },
  roomExists: function(address) {
    return this._rooms[address] !== undefined;
  }
}

module.exports = AppManager;

let RoomManager = require('./RoomManager');

function AppManager(io, options) {
  options = options || {};
  this._rooms = {};
  this._io = io;
  this._cacheSize = options.msgCacheLimit || 100;
}
AppManager.prototype = {
  genRoom: function(address) {
    let room = this._io.of('/' + address);
    this._rooms[address] = new RoomManager(room, address);
  },
  roomExists: function(address) {
    return this._rooms[address] !== undefined;
  }
}

module.exports = AppManager;

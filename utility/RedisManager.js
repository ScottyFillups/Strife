const REDIS_PORT = process.env.REDIS_PORT || 6379;

let redis = require('redis');

function RedisQueue(client, size) {
  this._client = client;
  this._size = size;
}
RedisQueue.prototype = {
  push: function(key, value) {
    this._client.rpush([key, JSON.stringify(value)]);
    this._client.llen(key, (err, reply) => {
      if (reply > this._size) {
        this._client.lpop(key);
      }
    });
  },
  loadAll: function(key, callback) {
    this._client.lrange(key, 0, -1, callback);
  }
};

function RedisManager(port) {
  this._port = port || REDIS_PORT;
  this._client = redis.createClient(this._port);
}
RedisManager.prototype = {
  getQueue: function(size) {
    return new RedisQueue(this._client, size);
  }
};

module.exports = RedisManager;

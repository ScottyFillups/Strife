const DEPLOY_TYPE = 'testing';
const WEBSERVER_PORT = process.env.PORT || 8080;
const REDIS_PORT = process.env.REDIS_URL || 6379;
const CACHE_LIMIT = 100;

let http = require('http');
let express = require('express');
let shortid = require('shortid');
let validator = require('validator');
let randomPrettyColor = require('randomcolor');
let keys = require('./config/keys')(DEPLOY_TYPE);
let quoteMaker = require('./utility/quotemaker')();

let app = express();
let server = http.Server(app);
let io = require('socket.io')(server);
let redisClient = require('redis').createClient(REDIS_PORT);

let active = false;
let rooms = {};
let lobbyNsp = io.of('/lobby');
let dailyQuote;
let url;

io.set('transports', ['websocket']);
app.use(express.static('public'));

app.get('/', function sendLobbyPage(req, res) {
  url = req.protocol + '://' + req.get('host');
  res.sendFile(__dirname + '/index.html');
});
app.get('/r/:room', function sendRoomPage(req, res) {
  let roomId = req.params.room;
  if (roomId in rooms) {
    res.sendFile(__dirname + '/room.html');
    joinRoom(roomId);
  } else {
    res.sendFile(__dirname + '/error.html');
  }
});

redisClient.on('connect', () => {
  console.log('redis client connected');
});

lobbyNsp.on('connection', (socket) => {
  console.log('somebody connected in the lobby');
  socket.emit('daily quote', quoteMaker.getQuote());
  socket.on('request room', () => {
    let roomId = shortid.generate();
    socket.emit('room generated', url + '/r/' + roomId);
    rooms[roomId] = {
      users: {},
      nspObj: undefined
    };
  });
});

setInterval( () => {
  if (active) {
    http.get('http://strifejs.herokuapp.com');
    active = false;
  }
}, 1000 * 60 * 29);

server.listen(WEBSERVER_PORT, () => {
  console.log('listening on port ' + WEBSERVER_PORT);
});

//make a room builder and a message builder
//look at the builder design pattern

//room builder takes id in constructor, creates a room instance
//maybe just room manager, with a build function? no room builder
//
//
//room manager has a room builder
//room builder has a message builder

function joinRoom(id) {
  //avoids redefine and duplicates
  if (rooms[id].nspObj === undefined) {
    let roomNsp = io.of('/' + id);
    rooms[id].nspObj = roomNsp;
    roomNsp.on('connection', (socket) => {
      console.log('somebody joined a room');
      socket.on('join room', (data) => {
        let userColor = randomPrettyColor();
        let message = {
          type: 'notification',
          user: validator.escape(data),
          message: ' has joined.',
          color: userColor,
          time: new Date()
        };
        addToRedis(id, JSON.stringify(message));
        rooms[id].users[socket.id] = {
          user: validator.escape(data),
          color: userColor
        };
        redisClient.lrange(id, 0, -1, (err, reply) => {
          socket.emit('load messages', reply);
          socket.broadcast.emit('push notification', message);
        });
      });
      socket.on('send message', (data) => {
        let message = {
          type: 'message',
          user: rooms[id].users[socket.id].user,
          message: validator.escape(data),
          color: rooms[id].users[socket.id].color,
          time: new Date()
        };
        addToRedis(id, JSON.stringify(message));
        roomNsp.emit('push message', message);
      });
      socket.on('disconnect', (data) => {
        if (rooms[id].users[socket.id]) {
          let message = {
            type: 'notification',
            user: rooms[id].users[socket.id].user,
            message: ' has left.',
            color: rooms[id].users[socket.id].color,
            time: new Date()
          };
          addToRedis(id, JSON.stringify(message));
          roomNsp.emit('push notification', message);
          delete rooms[id].users[socket.id];
        }
      });
    });
  }
}
function addToRedis(id, message) {
  redisClient.rpush([id, message], (err, reply) => {
    console.log('Message pushed');
  });
  redisClient.llen(id, (err, reply) => {
    if (reply > CACHE_LIMIT) {
      redisClient.lpop(id, (err, reply) => {
        console.log('Message popped');
      });
    }
  });
}


const express = require('express'),
      app = express(),
      http = require('http'),
      server = http.Server(app),
      unirest = require('unirest');
      io = require('socket.io')(server),
      shortid = require('shortid'),
      redisClient = require('redis').createClient(),
      MSG_CACHE_LIMIT = 100,
      validator = require('validator');

let active = false,
    rooms = {},
    lobbyNsp = io.of('/lobby'),
    dailyQuote,
    url;

app.use(express.static('public'));

app.get('/', (req, res) => {
  url = req.protocol + '://' + req.get('host');
  res.sendFile(__dirname + '/index.html');
});
app.get('/r/:room', (req, res) => {
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

getDailyQuote();

setInterval( () => {
  getDailyQuote();
}, 1000 * 60 * 60 * 24);

lobbyNsp.on('connection', (socket) => {
  console.log('somebody connected in the lobby');
  socket.emit('daily quote', dailyQuote);
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

const port = process.env.PORT || 8080;
server.listen(port, () => {
  console.log('listening on port ' + port);
});

function joinRoom(id) {
  //avoids redefine and duplicates
  if (rooms[id].nspObj === undefined) {
    let roomNsp = io.of('/' + id);
    rooms[id].nspObj = roomNsp;
    roomNsp.on('connection', (socket) => {
      console.log('somebody joined a room');
      socket.on('join room', (data) => {
        let userColor = getRandomRGB();
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
        let message = {
          type: 'notification',
          user: rooms[id].users[socket.id].user,
          message: ' has left.',
          color: rooms[id].users[socket.id].color,
          time: new Date()
        };
        addToRedis(id, JSON.stringify(message));
        roomNsp.emit('push notification', message);
        delete rooms[id][socket.id];
      });
    });
  }
}
function getDailyQuote() {
  unirest.get("https://andruxnet-random-famous-quotes.p.mashape.com/?cat=famous")
    .header("X-Mashape-Key", "1amV8UM1c1msh6zD34kpia7C2MVAp1zsw1AjsnosWjyInNQIHt")
    .header("Content-Type", "application/x-www-form-urlencoded")
    .header("Accept", "application/json")
    .end(function (res) {
      console.log(res.body);
      dailyQuote = res.body;
    });
}
function rgb() {
  return (Math.floor((Math.random() * 255))).toString();
}
function getRandomRGB() {
  return 'rgb(' + rgb() + ',' + rgb() + ',' + rgb() + ')';
}
function addToRedis(id, message) {
  redisClient.rpush([id, message], (err, reply) => {
    console.log('Message pushed');
  });
  redisClient.llen(id, (err, reply) => {
    if (reply > MSG_CACHE_LIMIT) {
      redisClient.lpop(id, (err, reply) => {
        console.log('Message popped');
      });
    }
  });
}


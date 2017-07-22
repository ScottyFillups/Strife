const express = require('express'),
      app = express(),
      http = require('http'),
      server = http.Server(app),
      unirest = require('unirest');
      io = require('socket.io')(server),
      shortid = require('shortid');

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
    rooms[roomId] = {users: []};
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
        rooms[id][socket.id] = data;
        roomNsp.emit('push notification', {
          user: data,
          message: ' has joined.',
          time: new Date()
        });
      });
      socket.on('send message', (data) => {
        roomNsp.emit('push message', data);
      });
      socket.on('disconnect', (data) => {
        roomNsp.emit('push notification', {
          user: rooms[id][socket.id],
          message: ' has left.',
          time: new Date()
        });
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

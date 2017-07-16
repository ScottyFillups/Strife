const express = require('express'),
      app = express(),
      http = require('http'),
      server = http.Server(app),
      io = require('socket.io')(server),
      shortid = require('shortid');

let active = false,
    cubbies = {},
    lobbyNsp = io.of('/lobby'),
    url;

app.use(express.static('public'));

app.get('/', (req, res) => {
  url = req.protocol + '://' + req.get('host');
  res.sendFile(__dirname + '/index.html');
});
app.get('/r/:cubby', (req, res) => {
  let cubbyId = req.params.cubby;
  if (cubbyId in cubbies) {
    res.sendFile(__dirname + '/cubby.html');
    joinCubby(cubbyId);
  } else {
    res.sendFile(__dirname + '/error.html');
  }
});

lobbyNsp.on('connection', (socket) => {
  console.log('somebody connected in the lobby');
  socket.on('request room', () => {
    let cubbyId = shortid.generate();
    socket.emit('room generated', url + '/r/' + cubbyId);
    cubbies[cubbyId] = {users: []};
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

function joinCubby(id) {
  //avoids redefine and duplicates
  if (cubbies[id].nspObj === undefined) {
    let roomNsp = io.of('/' + id);
    cubbies[id].nspObj = roomNsp;
    roomNsp.on('connection', (socket) => {
      console.log('somebody joined a room');
      socket.on('join room', (data) => {
        roomNsp.emit('push message', data + ' has joined.');
        cubbies[id][socket.id] = data;
      });
      socket.on('send message', (data) => {
        roomNsp.emit('push message', data.user + ': ' + data.message);
      });
      socket.on('disconnect', (data) => {
        roomNsp.emit('push message', cubbies[id][socket.id] + ' has left.');
      });
    });
  }
}

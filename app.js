var express = require('express');
var app = express();
var http = require('http');
var server = http.Server(app);
var io = require('socket.io')(http);
var active = false;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});
app.use(express.static('public'));

io.on('connection', function(socket) {
  var name;
  console.log('a user connected');
  socket.on('disconnect', function() {
    io.emit('chat message', name + ' has disconnected');
    console.log('a user disconnected');
  });
  socket.on('chat message', function(msg) {
    if (name) {
      active = true;
      io.emit('chat message', name + ': ' + msg);
      console.log('Message: ' + msg);
    }
  });
  socket.on('user connection', function(n) {
    if (!name) {
      name = n;
      io.emit('user connection', n + ' has connected');
      console.log(n + 'tst');
    }
  });
});

// nudge the heroku app to prevent sleep
setInterval(function() {
  if (active) {
    http.get("http://strifejs.herokuapp.com");
    active = false;
  }
}, 1000 * 60 * 29);


var port = process.env.PORT || 8080;
server.listen(port, function(){
  console.log('listening!');
});

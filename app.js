var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

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


var port = process.env.PORT || 8080;
http.listen(port, function(){
  console.log('listening!');
});

const DEPLOY_TYPE = 'testing';
const WEBSERVER_PORT = process.env.PORT || 8080;
const REDIS_PORT = process.env.REDIS_PORT;
const QUOTE_KEY = process.env.QUOTE_KEY_PROD;

console.log(REDIS_PORT);

let http = require('http');
let express = require('express');
let shortid = require('shortid');

let app = express();
let server = http.Server(app);
let io = require('socket.io')(server);
let appManager = new (require('./utility/AppManager'))(io);
let quoteMaker = new (require('./utility/QuoteMaker'))(QUOTE_KEY);

let active = false;
let lobbyNsp = io.of('/lobby');
let url;

io.set('transports', ['websocket']);
app.use(express.static('public'));

app.get('/', function sendLobbyPage(req, res) {
  url = req.protocol + '://' + req.get('host');
  res.sendFile(__dirname + '/index.html');
});
app.get('/r/:room', function sendRoomPage(req, res) {
  let address = req.params.room;
  if (appManager.roomExists(address)) {
    res.sendFile(__dirname + '/room.html');
  } else {
    res.sendFile(__dirname + '/error.html');
  }
});

lobbyNsp.on('connection', (socket) => {
  console.log('somebody connected in the lobby');
  socket.emit('daily quote', quoteMaker.getQuote());
  socket.on('request room', () => {
    let address = shortid.generate();
    socket.emit('room generated', url + '/r/' + address);
    appManager.genRoom(address);
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

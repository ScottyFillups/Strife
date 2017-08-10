let http = require('http');
let request = require('request');
let express = require('express');
let shortid = require('shortid');
let optional = require('optional');
let bodyParser = require('body-parser');
let mashapeKeys = optional('./config/mashapeKeys');
let recaptchaKeys = optional('./config/recaptchaKeys');

const WEBSERVER_PORT = process.env.PORT || 8080;
const QUOTE_KEY = process.env.QUOTE_KEY_PROD || mashapeKeys.PROD;
const RECAPTCHA_KEY = process.env.RECAPTCHA_KEY || recaptchaKeys.SECRET;

let app = express();
let server = http.Server(app);
let io = require('socket.io')(server);
let appManager = new (require('./utility/AppManager'))(io);
let quoteMaker = new (require('./utility/QuoteMaker'))();

let active = false;
let lobbyNsp = io.of('/lobby');
let url;

io.set('transports', ['websocket']);
app.use(express.static('public'));
app.use(bodyParser.text());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.get('/', function sendLobbyPage(req, res) {
  url = req.protocol + '://' + req.get('host');
  res.sendFile(__dirname + '/index.html');
});
app.get('/:room', function sendRoomPage(req, res) {
  let address = req.params.room;
  if (appManager.roomExists(address)) {
    res.sendFile(__dirname + '/room.html');
  } else {
    res.sendFile(__dirname + '/error.html');
  }
});

app.post('/recaptcha', function validateRecaptcha(req, res) {
  console.log('Post sent to Google');
  console.log(RECAPTCHA_KEY);
  console.log(req.body);
  recaptchaURL = 'https://www.google.com/recaptcha/api/siteverify?secret=' + RECAPTCHA_KEY + '&response=' + req.body + '&remoteip=' + req.connection.remoteAddress;
  request(recaptchaURL, function handleGoogleReply(err, googleRes, body) {
    console.log('Post received from Google');
    if (JSON.parse(body).success) {
      let address = shortid.generate();
      res.send(url + '/' + address);
      appManager.genRoom(address);
    } else {
      res.send('There\'s an error with the ReCaptcha, sorry :c');
    }
  });
});



lobbyNsp.on('connection', (socket) => {
  console.log('somebody connected in the lobby');
  socket.emit('daily quote', quoteMaker.getQuote());

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

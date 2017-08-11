let http = require('http');
let request = require('request');
let express = require('express');
let shortid = require('shortid');
let optional = require('optional');
let bodyParser = require('body-parser');
let recaptcha = require('invisible-recaptcha');
let mashapeKeys = optional('./config/mashapeKeys');
let recaptchaKeys = optional('./config/recaptchaKeys');

const WEBSERVER_PORT = process.env.PORT || 8080;
const QUOTE_KEY = process.env.QUOTE_KEY_PROD || mashapeKeys.PROD;
const RECAPTCHA_KEY = process.env.RECAPTCHA_KEY || recaptchaKeys.SECRET;

let app = express();
let server = http.Server(app);
let io = require('socket.io')(server);
let appManager = new (require('./utility/AppManager'))(io);
let quoteMaker = new (require('./utility/QuoteMaker'))(QUOTE_KEY);

let lobbyNsp = io.of('/lobby');
let url;

io.set('transports', ['websocket']);
app.use(express.static('public'));
app.use(bodyParser.text());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
recaptcha(app, RECAPTCHA_KEY, recaptchaSuccess, recaptchaFail);

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

function recaptchaSuccess(req, res) {
  let address = shortid.generate();
  res.send(url + '/' + address);
  appManager.genRoom(url, address);
}
function recaptchaFail(req, res) {
  res.send('There\'s an error with the ReCaptcha, sorry :c');
}

lobbyNsp.on('connection', (socket) => {
  console.log('somebody connected in the lobby');
  socket.emit('daily quote', quoteMaker.getQuote());
});

server.listen(WEBSERVER_PORT, () => {
  console.log('listening on port ' + WEBSERVER_PORT);
});

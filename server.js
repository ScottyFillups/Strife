let http = require('http');
let request = require('request');
let express = require('express');
let shortid = require('shortid');
let optional = require('optional');
let bodyParser = require('body-parser');
let recaptchaFactory = require('invisible-recaptcha');
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

let recaptchaRouter = recaptchaFactory(RECAPTCHA_KEY, recaptchaSuccess, recaptchaFail);
let lobby = require('./routes/lobby');
let room = require('./routes/room')(appManager);

let lobbyNsp = io.of('/lobby');

io.set('transports', ['websocket']);
app.use(express.static('public'));
app.use(bodyParser.text());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/recaptcha', recaptchaRouter);
app.use('/', lobby);
app.use('/', room);

function recaptchaSuccess(req, res) {
  let address = shortid.generate();
  appManager.genRoom(address);
  res.send(address);
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

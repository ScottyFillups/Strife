const DAY_TIMEOUT = 1000 * 60 * 60 * 24;
let unirest = require('unirest');

function quoteMaker(t) {
  let timeout = t || DAY_TIMEOUT;
  let module = {};
  let quote;

  (function genQuote() {
    unirest.get("https://andruxnet-random-famous-quotes.p.mashape.com/?cat=famous")
    .header("X-Mashape-Key", "1amV8UM1c1msh6zD34kpia7C2MVAp1zsw1AjsnosWjyInNQIHt")
    .header("Content-Type", "application/x-www-form-urlencoded")
    .header("Accept", "application/json")
    .end(function (res) {
      quote = res.body;
    });
    setTimeout(genQuote, timeout);
  })();

  module.getQuote = function() {
    return quote;
  }

  return module;
}

module.exports = quoteMaker;

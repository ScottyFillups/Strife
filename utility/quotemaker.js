const DAY_TIMEOUT = 1000 * 60 * 60 * 24;
const DEFAULT_QUOTE = {
  quote: 'IT\'S TIME TO STOP.',
  author: 'Filthy Frank',
  category: 'Filthy'
};
let unirest = require('unirest');

function quoteMaker(key, options) {
  let module = {};
  let quote;

  options = options || {};
  let refreshTime = options.timeout || DAY_TIMEOUT;
  let quoteType = options.type || 'famous';
  let quoteCount = options.count || '1';

  let url = `https://andruxnet-random-famous-quotes.p.mashape.com/?cat=${quoteType}&count=${quoteCount.toString()}`;

  (function genQuote() {
    unirest.get(url)
      .header('X-Mashape-Key', key)
      .header('Content-Type', 'application/x-www-form-urlencoded')
      .header('Accept', 'application/json')
      .end(function (res) {
        if (!res.body.message) {
          quote = res.body;
        }
      });
    setTimeout(genQuote, refreshTime);
  })();

  module.getQuote = function() {
    quote = quote || DEFAULT_QUOTE;
    return quote;
  }

  return module;
}

module.exports = quoteMaker;

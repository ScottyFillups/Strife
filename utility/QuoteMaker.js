const DAY_TIMEOUT = 1000 * 60 * 60 * 24;
const DEFAULT_QUOTE = {
  quote: 'IT\'S TIME TO STOP.',
  author: 'Filthy Frank',
  category: 'Filthy'
};
let unirest = require('unirest');

function QuoteMaker(key, options) {
  options = options || {};
  let refreshTime = options.timeout || DAY_TIMEOUT;
  let quoteType = options.type || 'famous';
  let quoteCount = options.count || '1';
  let url = `https://andruxnet-random-famous-quotes.p.mashape.com/?cat=${quoteType}&count=${quoteCount.toString()}`;
  let genQuote;

  this._quote;

  (genQuote = () => {
    unirest.get(url)
      .header('X-Mashape-Key', key)
      .header('Content-Type', 'application/x-www-form-urlencoded')
      .header('Accept', 'application/json')
      .end((res) => {
        if (res.body && res.body.quote) {
          this._quote = res.body;
        }
      });
    setTimeout(genQuote, refreshTime);
  })();
}
QuoteMaker.prototype = {
  getQuote: function() {
    this._quote = this._quote || DEFAULT_QUOTE;
    return this._quote;
  }
}

module.exports = QuoteMaker;

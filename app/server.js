const config = require('config')
const crypto = require('crypto')
const restify = require('restify')
const engine = require('./engine/tradeEngine')

const listeningPort = config.get('listeningPort')

const restifyCore = restify.createServer()

// The public API params are in the URL query.  We need queryParser to get them.
restifyCore.use(restify.plugins.queryParser())

// The private API params are x-www-form-urlencoded.  We need bodyParser to get them.
restifyCore.use(restify.plugins.bodyParser())

// module.exports = server = {
module.exports = {
  start: async () => {
    engine.brainWipe()

    // This is the route for the public API.  No signature gyrations here.
    restifyCore.get('/' + 'public', (req, res, next) => {
      switch (req.query.command) {
        /* 01 */ case 'returnTicker': { res.json(require('./cmd/returnTicker/impl')(engine)); break }
        /* 02 */ case 'return24Volume': { res.json(require('./cmd/return24Volume/impl')(engine)); break }
        /* 03 */ case 'returnOrderBook': { res.json(require('./cmd/returnOrderBook/impl')(req.query, engine)); break }
        /* 04 */ case 'returnTradeHistoryPublic': { res.json(require('./cmd/returnTradeHistoryPublic/impl')(req.query, engine)); break }
        /* 05 */ case 'returnChartData': { res.json(require('./cmd/returnChartData/impl')(req.query, engine)); break }
        /* 06 */ case 'returnCurrencies': { res.json(require('./cmd/returnCurrencies/impl')(engine)); break }
        /* 07 */ case 'returnLoanOrders': { res.json(require('./cmd/returnLoanOrders/impl')(engine)); break }

        // case 'returnCurrencies': res.json(config.get('testData.currencies')); break
      }
      next()
    })

    // This is the route for the private API
    restifyCore.post('/' + 'tradingApi', (req, res, next) => {

      // Morph the urlencoded body of the request into a string suitable for subsequent HMAC signature
      const paramString = Object.keys(req.body).map(function (param) {
        return encodeURIComponent(param) + '=' + encodeURIComponent(req.body[param]);
      }).join('&')

      const expectedSig = req.headers.sign
      const key = req.headers.key
      const actualSig = crypto.createHmac('sha512', config.get('testData.credentials')[key].secret).update(paramString).digest('hex')

      if (expectedSig === actualSig) {
        // The request is good.  How shall we reply?
        switch (req.body.command) {
          case 'returnDepositsWithdrawals': { res.json(require('./cmd/returnDepositsWithdrawals/impl')(req, engine)); break }
          case 'returnLendingHistory': { res.json(require('./cmd/returnLendingHistory/impl')(req, engine)); break }

          // case 'returnOpenOrders':
          // if (req.body.currencyPair === 'all') {
          // res.json(config.get('testData.returnOpenOrders_AllMarkets'))
          // } else { res.json(config.get('testData.returnOpenOrders_SingleMarket')) }
          // break
          // case 'buy': { res.json(require('./cmd/buy')(req, orders, tickers)); break }
          // case 'sell': { res.json(require('./cmd/sell')(req, orders, tickers)); break }
        }
        next()
      } else {
        throw new Error('Expected sig:' + expectedSig + ' does not equal the actual sig:' + actualSig)
      }
    })

    return new Promise((resolve, reject) => {
      restifyCore.listen(listeningPort, () => {
        console.log('The CatBox is listening at %s', restifyCore.url)
        resolve(true)
      })
    })
  },

  stop: async () => {
    restifyCore.close()
  }
}

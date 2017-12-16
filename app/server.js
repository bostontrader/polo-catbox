const config = require('config')
const crypto = require('crypto')
const restify = require('restify')
const engine = require('./engine/tradeEngine')
const c = require('./poloConstants')

const listeningPort = config.get('listeningPort')

const restifyCore = restify.createServer()

// The public API params are in the URL query.  We need queryParser to get them.
restifyCore.use(restify.plugins.queryParser())

// The private API params are x-www-form-urlencoded.  We need bodyParser to get them.
restifyCore.use(restify.plugins.bodyParser())

module.exports = {
  start: async () => {
    // This is the route for the public API.  No signature gyrations here.
    restifyCore.get('/' + 'public', (req, res, next) => {
      switch (req.query.command) {
        /* 01 */ case 'returnTicker': { res.json(require('./cmd/returnTicker/impl')(engine)); break }
        /* 02 */ case 'return24Volume': { res.json(require('./cmd/return24Volume/impl')(engine)); break }
        /* 03 */ case 'returnOrderBook': { res.json(require('./cmd/returnOrderBook/impl')(req.query, engine)); break }
        /* 04 */ case 'returnTradeHistoryPublic': { res.json(require('./cmd/returnTradeHistoryPublic/impl')(req.query, engine)); break }
        /* 05 */ case 'returnChartData': { res.json(require('./cmd/returnChartData/impl')(req.query, engine)); break }
        /* 06 */ case 'returnCurrencies': { res.json(require('./cmd/returnCurrencies/impl')(engine)); break }
        /* 07 */ // case 'returnLoanOrders': { res.json(require('./cmd/returnLoanOrders/impl')(engine)); break }
        default:
          res.json({error: c.INVALID_COMMAND})
      }
      next()
    })

    // This is the route for the private API
    restifyCore.post('/' + 'tradingApi', (req, res, next) => {
      // Morph the urlencoded body of the request into a string suitable for subsequent HMAC signature
      const paramString = Object.keys(req.body).map(function (param) {
        return encodeURIComponent(param) + '=' + encodeURIComponent(req.body[param])
      }).join('&')

      const expectedSig = req.headers.sign
      const apiKey = req.headers.key
      const actualSig = crypto.createHmac('sha512', config.get('testData.credentials')[apiKey].secret).update(paramString).digest('hex')

      if (expectedSig === actualSig) {
        // The request is good.  How shall we reply?
        switch (req.body.command) {
          /* 01 */ case 'returnBalances': { res.json(require('./cmd/returnBalances/impl')(apiKey, engine)); break }
          /* 02 */ // case 'returnCompleteBalances': { res.json(require('./cmd/returnCompleteBalances/impl')(engine)); break }
          /* 03 */ // case 'returnDepositAddresses': { res.json(require('./cmd/returnDepositAddresses/impl')(engine)); break }
          /* 04 */ // case 'generateNewAddress': { res.json(require('./cmd/generateNewAddress/impl')(engine)); break }
          /* 05 */ case 'returnDepositsWithdrawals': { res.json(require('./cmd/returnDepositsWithdrawals/impl')(apiKey, req.body, engine)); break }
          /* 06 */ // case 'returnOpenOrders': { res.json(require('./cmd/returnOpenOrders/impl')(req, engine)); break }
          /* 07 */ // case 'returnTradeHistory': { res.json(require('./cmd/returnTradeHistoryPrivate/impl')(req, engine)); break }
          /* 08 */
          /* 09 */ case 'buy': { res.json(require('./cmd/buy/impl')(apiKey, req.body, engine)); break }
          /* 10 */ case 'sell': { res.json(require('./cmd/sell/impl')(apiKey, req.body, engine)); break }

          // Catbox Extra
          /* 02 */ case 'makeDeposit': { res.json(require('./cmd/makeDeposit/impl')(apiKey, req.body, engine)); break }

          default:
            res.json({error: c.INVALID_COMMAND})
        }
        next()
      } else {
        throw new Error('Expected sig:' + expectedSig + ' does not equal the actual sig:' + actualSig)
      }
    })

    return new Promise((resolve, reject) => {
      restifyCore.listen(listeningPort, () => {
        console.log('Using config:', config.get('name'))
        console.log('The CatBox is listening at %s', restifyCore.url)
        resolve(true)
      })
    })
  },

  stop: async () => {
    restifyCore.close()
  },

  brainWipe: async () => {
    engine.brainWipe()
  },

  getEngine: () => {
    return engine
  }
}

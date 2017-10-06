const config  = require('config')
const crypto  = require('crypto')
const restify = require('restify')

const poloConstants = require('./poloConstants')

const listeningPort = config.get('listeningPort')

const restifyCore = restify.createServer()

// The public API params are in the URL query.  We need queryParser to get them.
restifyCore.use(restify.plugins.queryParser())

// The private API params are x-www-form-urlencoded.  We need bodyParser to get them.
restifyCore.use(restify.plugins.bodyParser())

module.exports = server = {

  start: async () => {
    return new Promise( (resolve, reject) => {

      // This is the route for the public API.  No signature gyrations here.
      restifyCore.get('/' + 'public', (req, res, next) => {
        switch(req.query.command) {
          case 'returnTicker':     res.json(config.get('testData.returnTicker'));     break
          case 'return24Volume':   res.json(config.get('testData.return24Volume'));   break
          case 'returnCurrencies': res.json(config.get('testData.currencies')); break

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
          switch(req.body.command) {
            case 'returnDepositsWithdrawals':
              res.json(config.get('testData.returnDepositsWithdrawals'))
              break
            case 'returnOpenOrders':
              if(req.body.currencyPair === 'all')
                res.json(config.get('testData.returnOpenOrders_AllMarkets'))
              else
                res.json(config.get('testData.returnOpenOrders_SingleMarket'))
              break
            case 'buy':
              const currencyPair = ('currencyPair' in req.body) ? req.body.currencyPair : undefined
              const rate         = ('rate'         in req.body) ? req.body.rate : 0
              const amount       = ('amount'       in req.body) ? req.body.amount : 0
              const fillOrKill   = ('fillOrKill' in req.body) ? req.body.fillOrKill : undefined
              const immediateOrCancel = ('immediateOrCancel' in req.body) ? req.body.immediateOrCancel : undefined
              const postOnly     = ('postOnly' in req.body) ? req.body.postOnly : undefined

              const total = rate * amount
              if (total < 0.0001)
                res.json({"error":poloConstants['TOTAL_MUST_BE_AT_LEAST_0.0001']})
              else
                res.json('BUY results')
              break
          }
          next()
        } else {
          throw new Error('Expected sig:' + expectedSig + ' does not equal the actual sig:' + actualSig)
        }
      })

      restifyCore.listen(listeningPort, () => {
        console.log('The CatBox is listening at %s', restifyCore.url)
        resolve(true)
      })
    })
  }
}

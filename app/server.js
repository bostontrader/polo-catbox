const config  = require('config')
const crypto  = require('crypto')
const restify = require('restify')

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
          case 'returnTicker':   res.json(config.get('testData.returnTicker'));   break
          case 'return24Volume': res.json(config.get('testData.return24Volume')); break
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
        const actualSig = crypto.createHmac('sha512', config.get('credentials')[key].secret).update(paramString).digest('hex')

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

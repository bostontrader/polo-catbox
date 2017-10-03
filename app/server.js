const config  = require('config')
const crypto  = require('crypto')
const restify = require('restify')

const listeningPort = config.get('listeningPort')

const restifyCore = restify.createServer()

// The private API params are x-www-form-urlencoded.  We need bodyParser to get them.
restifyCore.use(restify.plugins.bodyParser())

module.exports = server = {

  start: async () => {
    return new Promise( (resolve, reject) => {

      restifyCore.post('/' + 'tradingApi', (req, res, next) => {

        // Morph the urlencoded body of the request into a string suitable for subsequent HMAC signature
        const paramString = Object.keys(req.body).map(function (param) {
          return encodeURIComponent(param) + '=' + encodeURIComponent(req.body[param]);
        }).join('&')

        const expectedSig = req.headers.sign
        const actualSig = crypto.createHmac('sha512', config.get('keys.secret')).update(paramString).digest('hex')

        if (expectedSig === actualSig) {
          res.json(config.get('testData.returnDepositsWithdrawals'))
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

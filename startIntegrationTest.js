const colors    = require('colors/safe')
const config    = require('config')
const deepEqual = require('deep-equal')
const request   = require('request')

const Poloniex = require('./polo-adapter')

const server = require('./app/server')

const startIntegrationTest = async () => {


  try {

    const u = config.get('url')
    const url = u.protocol + "://" + u.host + ":" + u.port + "/tradingApi"
    const keys = config.get('keys')
    const poloniexPrivate = new Poloniex(keys.apiKey, keys.secret, 0, url)

    await server.start()
    .then( result => {
      return new Promise( (resolve, reject) => {
        const startDt = 0
        const stopDt = Date.now()
        poloniexPrivate.returnDepositsWithdrawals(startDt, stopDt, (err, data) => {
          if(err) throw new Error(err)
          resolve(data)
        })
      })
    })

    .then(result => {
      if(!deepEqual(result, config.get('testData.returnDepositsWithdrawals')))
        throw new Error('returnDepositsWithdrawals failed its test')
      console.log(colors.green('All tests passed'))
      process.exit()
    })

  } catch(e) {
    console.log(e)
    process.exit()
  }

}

startIntegrationTest()

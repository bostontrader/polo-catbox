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
    let result

    await server.start()

    console.log('testing returnDepositsWithdrawals')
    result = await poloniexPrivate.returnDepositsWithdrawals(0,  Date.now())
    if(!deepEqual(result, config.get('testData.returnDepositsWithdrawals')))
      throw new Error('returnDepositsWithdrawals failed its test')

    console.log('testing returnOpenOrders_SingleMarket')
    result = await poloniexPrivate.returnOpenOrders('BTC_LTC')
    if(!deepEqual(result, config.get('testData.returnOpenOrders_SingleMarket')))
      throw new Error('returnOpenOrders_SingleMarket failed its test')

    console.log('testing returnOpenOrders_AllMarkets')
    result = await poloniexPrivate.returnOpenOrders('all')
    if(!deepEqual(result, config.get('testData.returnOpenOrders_AllMarkets')))
      throw new Error('returnOpenOrders_AllMarkets failed its test')

    console.log(colors.green('All tests passed'))
    process.exit()


  } catch(e) {
    console.log(e)
    process.exit()
  }

}

startIntegrationTest()

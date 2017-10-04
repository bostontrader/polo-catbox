const colors    = require('colors/safe')
const config    = require('config')
const deepEqual = require('deep-equal')
const request   = require('request')

const Poloniex = require('./polo-adapter')

const server = require('./app/server')

const startIntegrationTest = async () => {


  try {

    const u = config.get('url')
    const baseURL = u.protocol + "://" + u.host + (u.port ? ":" + u.port : '')

    const keys = config.get('keys')
    const poloAdapter = new Poloniex(keys.apiKey, keys.secret, 0, baseURL)
    let result

    await server.start()

    // Test the public API endpoints
    console.log('testing returnTicker')
    result = await poloAdapter.returnTicker(0,  Date.now())
    if(!deepEqual(result, config.get('testData.returnTicker')))
      throw new Error('returnTicker failed its test')


    // Test the private API endpoints
    console.log('testing returnDepositsWithdrawals')
    result = await poloAdapter.returnDepositsWithdrawals(0,  Date.now())
    if(!deepEqual(result, config.get('testData.returnDepositsWithdrawals')))
      throw new Error('returnDepositsWithdrawals failed its test')

    console.log('testing returnOpenOrders_SingleMarket')
    result = await poloAdapter.returnOpenOrders('BTC_LTC')
    if(!deepEqual(result, config.get('testData.returnOpenOrders_SingleMarket')))
      throw new Error('returnOpenOrders_SingleMarket failed its test')

    console.log('testing returnOpenOrders_AllMarkets')
    result = await poloAdapter.returnOpenOrders('all')
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

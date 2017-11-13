const colors    = require('colors/safe')
const config    = require('config')
const deepEqual = require('deep-equal')
const request   = require('request')

const PoloAdapter = require('./polo-adapter')

const server = require('./app/server')


// These are the seven known public API endpoints.
const returnTickerTest     = require('./test/returnTicker.test')
//return24Volume
//returnOrderBook
//returnTradeHistory
//returnChartData
const returnCurrenciesTest = require('./test/returnCurrencies.test')
//returnLoanOrders

// These are the 28 known private trading API endpoints.
//returnBalances
//returnCompleteBalances
//returnDepositAddresses
//generateNewAddress
//returnDepositsWithdrawals
//returnOpenOrders
//returnTradeHistory
//returnOrderTrades
const buyTest = require('./test/buy.test')
const sellTest = require('./test/sell.test')
//cancelOrder
//moveOrder
//withdraw
//returnFeeInfo
//returnAvailableAccountBalances
//returnTradableBalances
//transferBalance
//returnMarginAccountSummary
//marginBuy
//marginSell
//getMarginPosition
//closeMarginPosition
//createLoanOffer
//cancelLoanOffer
//returnOpenLoanOffers
//returnActiveLoans
//returnLendingHistory
//toggleAutoRenew

const startIntegrationTest = async () => {

  try {

    const u = config.get('url')
    const baseURL = u.protocol + "://" + u.host + (u.port ? ":" + u.port : '')
    const poloAdapter = new PoloAdapter('thing1', config.get('testData.credentials').thing1.secret, 0, baseURL)
    let result

    await server.start()

    // Test the public API endpoints

    // There are no input parameters for this endpoint.  EZ.
    //console.log('testing returnTicker')
    //result = await poloAdapter.returnTicker(0,  Date.now())
    //if(!deepEqual(result, config.get('testData.returnTicker')))
      //throw new Error('returnTicker failed its test')
    await returnTickerTest(poloAdapter)

    // There are no input parameters for this endpoint.  EZ.
    console.log('testing return24Volume')
    result = await poloAdapter.return24Volume(0,  Date.now())
    if(!deepEqual(result, config.get('testData.return24Volume')))
      throw new Error('return24Volume failed its test')

    await returnCurrenciesTest(poloAdapter)

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

    await buyTest(poloAdapter)
    await sellTest(poloAdapter)

    console.log(colors.green('All tests passed'))
    process.exit()


  } catch(e) {
    console.log(e)
    process.exit()
  }

}

startIntegrationTest()

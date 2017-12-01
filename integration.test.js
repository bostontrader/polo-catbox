// Start the server and send requests.  Only enough to verify that the server really will respond.
const config = require('config')
const crypto = require('crypto')

const rp = require('request-promise-native')

const server = require('./app/server')

const tradingAPIOptions = {
  method: 'POST',
  url: 'http://localhost:3003/tradingApi'
}

const getPrivateHeaders = function (parameters) {
  let paramString, signature

  // if (!key || !secret) { throw new Error('PoloAdapter: Error. API key and secret required') }
  const key = 'me'
  const secret = 'my secret'
  // Convert to `arg1=foo&arg2=bar`
  paramString = Object.keys(parameters).map(param => encodeURIComponent(param) + '=' + encodeURIComponent(parameters[param])).join('&')
  signature = crypto.createHmac('sha512', secret).update(paramString).digest('hex')
  return {Key: key, Sign: signature}
}

server.start()
  .then(() => {
    /* 01 */ return rp('http://localhost:3003/public?command=returnTicker')
  })
  .then((html) => {
    console.log('returnTicker: ', html)
    /* 02 */ return rp('http://localhost:3003/public?command=return24Volume')
  })
  .then((html) => {
    console.log('return24Volume: ', html)
    /* 03 */ return rp('http://localhost:3003/public?command=returnOrderBook&currencyPair=all')
  })
  .then((html) => {
    console.log('returnOrderBook: ', html)
    /* 04 */ return rp('http://localhost:3003/public?command=returnTradeHistoryPublic&currencyPair=' + config.get('testData.markets')[0])
  })
  .then((html) => {
    console.log('returnTradeHistoryPublic: ', html)
    /* 05 */ return rp('http://localhost:3003/public?command=returnChartData&currencyPair=' + config.get('testData.markets')[0] + '&period=86400&start=0')
  })
  .then((html) => {
    console.log('returnChartData: ', html)
    /* 06 */ return rp('http://localhost:3003/public?command=returnCurrencies')
  })
  .then((html) => {
    console.log('returnCurrencies: ', html)
    /* 07 */ return rp('http://localhost:3003/public?command=returnLoanOrders')
  })
  .then((html) => {
    console.log('returnLoanOrders ', html)
    const parameters = {command: 'returnBalances', nonce: Date.now() * 1000}
    tradingAPIOptions.form = parameters
    tradingAPIOptions.headers = getPrivateHeaders(parameters)
    /* 01 */ return rp(tradingAPIOptions)
  })
  .then((html) => {
    console.log('returnBalances ', html)
    const parameters = {command: 'returnCompleteBalances', nonce: Date.now() * 1000}
    tradingAPIOptions.form = parameters
    tradingAPIOptions.headers = getPrivateHeaders(parameters)
    /* 02 */ return rp(tradingAPIOptions)
  })
  .then((html) => {
    console.log('returnCompleteBalances ', html)
    server.stop()
  })

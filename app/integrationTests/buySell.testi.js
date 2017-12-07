const test = require('ava')
const config = require('config')
const crypto = require('crypto')

const rp = require('request-promise-native')

const server = require('../server')

const getPrivateHeaders = function (parameters) {
  let paramString, signature

  const key = 'me'
  const secret = 'my secret'
  // Convert to `arg1=foo&arg2=bar`
  paramString = Object.keys(parameters).map(param => encodeURIComponent(param) + '=' + encodeURIComponent(parameters[param])).join('&')
  signature = crypto.createHmac('sha512', secret).update(paramString).digest('hex')
  return {Key: key, Sign: signature}
}

const u = config.get('url')
const baseURL = u.protocol + '://' + u.host + (u.port ? ':' + u.port : '')
const publicURL = baseURL + '/public'

const tradingAPIOptions = {
  method: 'POST',
  url: baseURL + '/tradingApi'
}

// In order to buy or sell anything we must first ensure sufficient funds. So we will use these currencies.
const currencyPair = config.get('testData.markets')[0]
const currencies = currencyPair.split('_')
const baseCurrency = currencies[0]
const quoteCurrency = currencies[1]

// Demonstrate that I can make HTTP requests and get responses all the way from the Engine.
test.serial(async t => {
  await server.start()
    .then(() => { return server.brainWipe() })
    .then(() => {
      // 1. In order to buy or sell anything we must first ensure sufficient funds.
      server.getEngine().makeDeposit('me', baseCurrency, 1000)
      server.getEngine().makeDeposit('me', quoteCurrency, 1000)
      return Promise.resolve(true)
    })
    .then(() => {
      const parameters = {command: 'buy', nonce: Date.now(), currencyPair, rate: 1, amount: 500}
      tradingAPIOptions.form = parameters
      tradingAPIOptions.headers = getPrivateHeaders(parameters)
      return rp(tradingAPIOptions)
    })
    .then((html) => {
      const actual = JSON.parse(html)
      const expected = {orderNumber: '1', resultingTrades: []}
      t.deepEqual(actual, expected)
      return Promise.resolve(true)
    })
    .then(() => {
      const parameters = {command: 'sell', nonce: Date.now(), currencyPair, rate: 2, amount: 500}
      tradingAPIOptions.form = parameters
      tradingAPIOptions.headers = getPrivateHeaders(parameters)
      return rp(tradingAPIOptions)
    })
    .then((html) => {
      const actual = JSON.parse(html)
      const expected = {orderNumber: '1', resultingTrades: []}
      t.deepEqual(actual, expected)
      return Promise.resolve(true)
    })
    .then((html) => {
      return rp(publicURL + '?command=returnTradeHistoryPublic&currencyPair=' + config.get('testData.markets')[0])
    })
    .then((html) => {
      const actual = JSON.parse(html)
      const expected = []
      t.deepEqual(actual, expected)
      return Promise.resolve(true)
    })
    .then(() => {server.stop()})
})

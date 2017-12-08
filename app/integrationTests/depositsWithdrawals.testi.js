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

    // 1. In order to buy or sell anything we must first ensure sufficient funds.
    .then(() => {
      server.getEngine().makeDeposit('me', baseCurrency, 1000, 1500000000)
      server.getEngine().makeDeposit('me', quoteCurrency, 1000, 1510000000)
      return Promise.resolve(true)
    })

    // 2.1 returnDepositsWithdrawals
    .then(() => {
      const parameters = {command: 'returnDepositsWithdrawals', nonce: Date.now(), start: 0, end: 1520000000}
      tradingAPIOptions.form = parameters
      tradingAPIOptions.headers = getPrivateHeaders(parameters)
      return rp(tradingAPIOptions)
    })

    // 2.2 Check the result.
    .then((html) => {
      const actual = JSON.parse(html)
      const expected = {
        deposits: [
          {
            currency: 'BTC',
            address: 'random address',
            amount: 1000,
            confirmations: 1,
            txid: 'random tx id',
            timestamp: 1500000000,
            status: 'COMPLETE'
          },
          {
            currency: 'LTC',
            address: 'random address',
            amount: 1000,
            confirmations: 1,
            txid: 'random tx id',
            timestamp: 1510000000,
            status: 'COMPLETE' }
        ],
        withdrawals: []
      }

      t.deepEqual(actual, expected)
      return Promise.resolve(true)
    })

    .then(() => { server.stop() })
})

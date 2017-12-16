// Start the server and send requests.  Only enough to verify that the server really will respond.
// const config = require('config')
const crypto = require('crypto')

const rp = require('request-promise-native')

const server = require('../server')

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

const u = config.get('url')
const baseURL = u.protocol + '://' + u.host + (u.port ? ':' + u.port : '')
const publicURL = baseURL + '/public'

const tradingAPIOptions = {
  method: 'POST',
  url: baseURL + '/tradingApi'
}
console.log(28, baseURL)

server.start()

  /* 05 */ .then((html) => {
    return rp(publicURL + '?command=returnChartData&currencyPair=' + config.get('testData.markets')[0] + '&period=86400&start=0')
      .then(html => { console.log('05 returnChartData: ', html); return Promise.resolve(true) })
  })

  /* 07 */ .then((html) => {
    return rp(publicURL + '?command=returnLoanOrders')
      .then(html => { console.log('07 returnLoanOrders: ', html); return Promise.resolve(true) })
  })

  .then((html) => {
    return rp(publicURL + '?command=catfood')
      .then(html => { console.log('Expected error: ', html); return Promise.resolve(true) })
  })

  /* 01 */ .then((html) => {
    const parameters = {command: 'returnBalances', nonce: Date.now() * 1000}
    tradingAPIOptions.form = parameters
    tradingAPIOptions.headers = getPrivateHeaders(parameters)
    return rp(tradingAPIOptions)
      .then(html => { console.log('01 returnBalances: ', html); return Promise.resolve(true) })
  })

  /* 02 */ .then((html) => {
    const parameters = {command: 'returnCompleteBalances', nonce: Date.now() * 1000}
    tradingAPIOptions.form = parameters
    tradingAPIOptions.headers = getPrivateHeaders(parameters)
    return rp(tradingAPIOptions)
      .then(html => { console.log('02 returnCompleteBalances: ', html); return Promise.resolve(true) })
  })

  /* 03 */ .then((html) => {
    const parameters = {command: 'returnDepositAddresses', nonce: Date.now() * 1000}
    tradingAPIOptions.form = parameters
    tradingAPIOptions.headers = getPrivateHeaders(parameters)
    return rp(tradingAPIOptions)
      .then(html => { console.log('03 returnDepositAddresses: ', html); return Promise.resolve(true) })
  })

  /* 04 */ .then((html) => {
    const parameters = {command: 'generateNewAddress', nonce: Date.now() * 1000}
    tradingAPIOptions.form = parameters
    tradingAPIOptions.headers = getPrivateHeaders(parameters)
    return rp(tradingAPIOptions)
      .then(html => { console.log('04 generateNewAddress: ', html); return Promise.resolve(true) })
  })

  /* 05 */ .then((html) => {
    const parameters = {command: 'returnDepositsWithdrawals', nonce: Date.now() * 1000}
    tradingAPIOptions.form = parameters
    tradingAPIOptions.headers = getPrivateHeaders(parameters)
    return rp(tradingAPIOptions)
      .then(html => { console.log('05 returnDepositsWithdrawals: ', html); return Promise.resolve(true) })
  })

  /* 06 */ .then((html) => {
    const parameters = {command: 'returnOpenOrders', nonce: Date.now() * 1000}
    tradingAPIOptions.form = parameters
    tradingAPIOptions.headers = getPrivateHeaders(parameters)
    return rp(tradingAPIOptions)
      .then(html => { console.log('06 returnOpenOrders: ', html); return Promise.resolve(true) })
  })

  /* 07 */ .then((html) => {
    const parameters = {command: 'returnTradeHistory', nonce: Date.now() * 1000}
    tradingAPIOptions.form = parameters
    tradingAPIOptions.headers = getPrivateHeaders(parameters)
    return rp(tradingAPIOptions)
      .then(html => { console.log('07 returnTradeHistory: ', html); return Promise.resolve(true) })
  })

  .then((html) => {
    const parameters = {command: 'catfood'}
    tradingAPIOptions.form = parameters
    tradingAPIOptions.headers = getPrivateHeaders(parameters)
    return rp(tradingAPIOptions)
      .then(html => { console.log('Expected error: ', html); return Promise.resolve(true) })
  })

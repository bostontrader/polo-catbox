const test = require('ava')
const config = require('config')
const rp = require('request-promise-native')

const server = require('../server')

const u = config.get('url')
const baseURL = u.protocol + '://' + u.host + (u.port ? ':' + u.port : '')
const publicURL = baseURL + '/public'

// Demonstrate that I can make an HTTP request and get a response all the way from the Engine.
test.serial(async t => {
  await server.start()
    .then(() => { return server.brainWipe() })
    .then(() => {
      return rp(
        publicURL + '?command=returnChartData&currencyPair=' + config.get('testData.markets')[0] + '&period=300&start=0')
    })
    .then((html) => {
      const actual = JSON.parse(html)
      const expected = [{date: 0, high: 0, low: 0, open: 0, close: 0, volume: 0, quoteVolume: 0, weightedAverage: 0}]
      t.deepEqual(actual, expected)
      server.stop()
    })
})

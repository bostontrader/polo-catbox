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
    .then(() => { return rp(publicURL + '?command=returnTicker') })
    .then((html) => {
      const n = JSON.parse(html)
      config.get('testData.markets').forEach(market => {
        const actual = n[market]
        delete actual.id
        const expected = {
          isFrozen: 0
          // These other fields are returned from the Engine but are weeded out by the server.
          // lowestAsk: undefined
          // highestBid: undefined,
          // last: undefined,
          // percentChange: undefined,
          // baseVolume: undefined,
          // quoteVolume: undefined,
          // high24hr: undefined,
          // low24hr: undefined
        }

        t.deepEqual(actual, expected)
        delete n[market]
      })
      t.deepEqual(n, {}) // Verify that no other markets are in the ticker.
      server.stop()
    })
})

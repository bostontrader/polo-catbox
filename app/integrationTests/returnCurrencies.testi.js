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
    .then(() => { return rp(publicURL + '?command=returnCurrencies') })
    .then((html) => {
      const actual = JSON.parse(html)
      const expected = config.get('testData.currencies')
      t.deepEqual(actual, expected)
      server.stop()
    })
})

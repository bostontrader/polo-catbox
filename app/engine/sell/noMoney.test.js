/*
You cannot sell if you don't have sufficient funds in the quoteCurrency.
*/
const test = require('ava')
const config = require('config')

const engine = require('../tradeEngine')
const c = require('../../poloConstants')

test(t => {
  const currencyPair = config.get('testData.markets')[0]
  const currencies = currencyPair.split('_')
  const quoteCurrency = currencies[1]

  // 1. Try to sell anything.  There's not enough money in the account, so error.
  const actual = engine.sell({apiKey: 'me', currencyPair, dt: 2000, rate: 0.019, amount: 1.0})
  const expected = {error: c.sell.NOT_ENOUGH + ' ' + quoteCurrency + '.'}
  t.deepEqual(actual, expected)
})

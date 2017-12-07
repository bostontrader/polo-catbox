/*
You cannot buy if you don't have sufficient funds in the baseCurrency.
*/
const test = require('ava')
const config = require('config')

const engine = require('../tradeEngine')
const c = require('../../poloConstants')

test(t => {
  const currencyPair = config.get('testData.markets')[0]
  const currencies = currencyPair.split('_')
  const baseCurrency = currencies[0]

  // 1. Try to buy anything.  There's not enough money in the account, so error.
  const actual = engine.buy({apiKey: 'me', currencyPair, dt: 2000, rate: 0.019, amount: 1.0})
  const expected = {'error': c.NOT_ENOUGH + ' ' + baseCurrency + '.'}
  t.deepEqual(actual, expected)
})

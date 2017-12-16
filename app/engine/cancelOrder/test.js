const test = require('ava')
const config = require('config')

const c = require('../../poloConstants')
const engine = require('../tradeEngine')

test(t => {
  let actual, expected
  const currencyPair = config.get('testData.markets')[0]
  const currencies = currencyPair.split('_')
  const baseCurrency = currencies[0]

  engine.brainWipe()

  // 1. In order to buy or sell anything we must first ensure sufficient funds.
  engine.makeDeposit('me', baseCurrency, 100)
  engine.makeDeposit('others', baseCurrency, 100)

  // 2. Try to cancel an order that doesn't exist.
  actual = engine.cancelOrder('me', 5)
  expected = { error: c.cancelOrder.INVALID_OR_NOT_YOU, success: 0 }
  t.deepEqual(actual, expected)

  // 3. Try to cancel somebody else's order.
  engine.buy({apiKey: 'others', currencyPair, dt: 2000, orderNumber: 100, rate: 0.018, amount: 1.0, postOnly: 1})
  actual = engine.cancelOrder('me', 100)
  expected = { error: c.cancelOrder.INVALID_OR_NOT_YOU, success: 0 }
  t.deepEqual(actual, expected)

  // 4. Cancel my own order.
  engine.buy({apiKey: 'me', currencyPair, dt: 2000, orderNumber: 101, rate: 0.018, amount: 1.0, postOnly: 1})
  actual = engine.cancelOrder('me', 101)
  expected = {'success': 1}
  t.deepEqual(actual, expected)

  // 4. Now try to cancel it again.
  actual = engine.cancelOrder('me', 101)
  expected = { error: c.cancelOrder.INVALID_OR_NOT_YOU, success: 0 }
  t.deepEqual(actual, expected)
})

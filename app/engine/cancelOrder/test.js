const test = require('ava')
const c = require('../../poloConstants')
const engine = require('../tradeEngine')

test.serial(t => {
  let actual, expected, orderNumber

  engine.brainWipe()

  // 1. Try to cancel an order that doesn't exist.
  actual = engine.cancelOrder('me', 5)
  expected = { error: c.cancelOrder.INVALID_OR_NOT_YOU, success: 0 }
  t.deepEqual(actual, expected)

  // 2. Try to cancel somebody else's order.
  engine.buy({apiKey: 'other', currencyPair: 'BTC_LTC', dt: 2000, orderNumber: 100, rate: 0.018, amount: 1.0, postOnly: 1})
  actual = engine.cancelOrder('me', 100)
  expected = { error: c.cancelOrder.INVALID_OR_NOT_YOU, success: 0 }
  t.deepEqual(actual, expected)

  // 3. Cancel my own order.
  engine.buy({apiKey: 'me', currencyPair: 'BTC_LTC', dt: 2000, orderNumber: 101, rate: 0.018, amount: 1.0, postOnly: 1})
  actual = engine.cancelOrder('me', 101)
  expected = {'success': 1}
  t.deepEqual(actual, expected)

  // 4. Now try to cancel it again.
  actual = engine.cancelOrder('me', 101)
  expected = { error: c.cancelOrder.INVALID_OR_NOT_YOU, success: 0 }
  t.deepEqual(actual, expected)
})

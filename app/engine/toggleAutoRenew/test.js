const test = require('ava')

const engine = require('../tradeEngine')

test(t => {
  engine.brainWipe()
  const orderNumber = 666
  const actual = engine.toggleAutoRenew(orderNumber)
  const expected = {'success': 1, 'message': 0}

  t.deepEqual(actual, expected)
})

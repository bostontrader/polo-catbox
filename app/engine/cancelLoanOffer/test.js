const test = require('ava')

const engine = require('../tradeEngine')

test.serial(t => {
  engine.brainWipe()
  const orderNumber = 666
  const actual = engine.cancelLoanOffer(orderNumber)
  const expected = {'success': 1, 'message': 'Loan offer canceled.'}

  t.deepEqual(actual, expected)
})

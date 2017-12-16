const test = require('ava')

const engine = require('../tradeEngine')

test(t => {
  engine.brainWipe()
  const actual = engine.acceptLoan()
  const expected = {'success': 1}

  t.deepEqual(actual, expected)
})

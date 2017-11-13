const test = require('ava')

const engine = require('../tradeEngine')

test.serial(t => {
  engine.brainWipe()
  const actual = engine.generateNewAddress('me')
  const expected = {'success': 1}

  t.deepEqual(actual, expected)
})

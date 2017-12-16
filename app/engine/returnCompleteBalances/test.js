const test = require('ava')

const engine = require('../tradeEngine')

test(t => {
  engine.brainWipe()
  const actual = engine.returnCompleteBalances('me')
  const expected = {'success': 1}

  t.deepEqual(actual, expected)
})

import Shape, {number} from 'matches-shape'
const test = require('ava')

const engine = require('../tradeEngine')

// This test only tests the shape of the returned balances.  Other methods that affect the balance will test that the balance is changed, when said method is invoked.
test.serial(t => {
  engine.brainWipe()
  const balances = engine.returnBalances('me')

  // 1. is the main result an object?
  t.is(new Shape({}).matches(balances), true)

  // 2. are the individual values correctly shaped?
  const balanceShape = new Shape(number)

  Object.entries(balances).forEach(entry => {
    t.is(balanceShape.matches(entry[1]), true)
  })
})

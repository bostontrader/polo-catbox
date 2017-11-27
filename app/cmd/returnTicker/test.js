const test = require('ava')
const engine = require('../../engine/tradeEngine')
const returnTicker = require('./impl')

test.serial(t => {
  let actual, expected

  engine.brainWipe()

  // This API endpoint does not have any parameters, so there's nothing to test here.  Testing is therefore a job for the Engine's implementation of return24Volume.
  actual = returnTicker(engine)
  expected = {}
  t.deepEqual(actual, expected)
})

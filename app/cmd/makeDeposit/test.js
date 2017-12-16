const test = require('ava')

const makeDeposit = require('./impl')
const engine = require('../../engine/tradeEngine')
const c = require('../../poloConstants')

// This is a catbox extra
test(t => {
  let actual, expected
  let mockRequestBody = {}

  engine.brainWipe()

  // 1. No params. Yes, this seems like an odd reply.
  actual = makeDeposit('key', mockRequestBody, engine)
  expected = {error: c.makeDeposit.REQUIRED_PARAMETER_MISSING + ': currency'}
  t.deepEqual(actual, expected)
})

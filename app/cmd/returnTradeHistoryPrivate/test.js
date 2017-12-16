const test = require('ava')
const engine = require('../../engine/tradeEngine')
const returnTradeHistoryPrivate = require('./impl')
const c = require('../../poloConstants')

test(t => {
  let actual, expected
  let mockRequest

  engine.brainWipe()

  // The API parameters should be in the request object.  Let's make a mockRequest
  // let mockRequest

  // 1. No params.
  mockRequest = {body: {}}
  actual = returnTradeHistoryPrivate(mockRequest, engine)
  expected = []
  t.deepEqual(actual, expected)

  // 2. Must have a currencyPair parameter.
  mockRequest = {body: {start: 'a'}}
  actual = returnTradeHistoryPrivate(mockRequest, engine)
  expected = {error: c.returnTradeHistoryPrivate.REQUIRED_PARAMETER_MISSING}
  t.deepEqual(actual, expected)

  // 3. Whichever numeric parameter is not an integer is bad.
  mockRequest = {body: {currencyPair: 'all', start: 'a'}}
  actual = returnTradeHistoryPrivate(mockRequest, engine)
  expected = {error: c.returnTradeHistoryPrivate.INVALID_START_PARAMETER}
  t.deepEqual(actual, expected)

  mockRequest = {body: {currencyPair: 'all', end: 'a'}}
  actual = returnTradeHistoryPrivate(mockRequest, engine)
  expected = {error: c.returnTradeHistoryPrivate.INVALID_END_PARAMETER}
  t.deepEqual(actual, expected)

  mockRequest = {body: {currencyPair: 'all', limit: 'a'}}
  actual = returnTradeHistoryPrivate(mockRequest, engine)
  expected = {error: c.returnTradeHistoryPrivate.INVALID_LIMIT_PARAMETER}
  t.deepEqual(actual, expected)

  // If there are really any relevant trades in the history, and the parameters are properly set, then testing that is a job for the Engine's implementation of returnTradeHistoryPrivate
})

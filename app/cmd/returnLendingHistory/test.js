const test = require('ava')
const engine = require('../../engine/tradeEngine')
const returnLendingHistory = require('./impl')
const c = require('../../poloConstants')

test.serial(t => {

  let actual, expected

  engine.brainWipe()

  // The API parameters should be in the request object.  Let's make a mockRequest
  let mockRequest

  // 1. No params.
  mockRequest = {body: {}}
  actual = returnLendingHistory(mockRequest, engine)
  expected = []
  t.deepEqual(actual, expected)

  // 2. Whichever parameter is not an integer is bad.
  /* mockRequest = {body: {start: 'a'}}
  actual = returnLendingHistory(mockRequest, engine)
  expected = {'error': c.returnLendingHistory.INVALID_START_PARAMETER}
  t.deepEqual(actual, expected)

  mockRequest = {body: {end: 'a'}}
  actual = returnLendingHistory(mockRequest, engine)
  expected = {'error': c.returnLendingHistory.INVALID_END_PARAMETER}
  t.deepEqual(actual, expected)

  mockRequest = {body: {limit: 'a'}}
  actual = returnLendingHistory(mockRequest, engine)
  expected = {'error': c.returnLendingHistory.INVALID_LIMIT_PARAMETER}
  t.deepEqual(actual, expected) */

  // 3. All of these {start: -1}, {start: -1, end: -1}, {end: -1}, {limit: 0},{start: 0, end: 9999999999}, {start: 0, end: 1600000000} {end < start } should produce and empty array.  But I'll leave it as an exercise for the reader to implement the tests.

  // If there are really any loans in the history, and the start and end times are properly set, then testing that is a job for the Engine's implementation of returnLendingHistory
})

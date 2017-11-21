const test = require('ava')
const engine = require('../../engine/tradeEngine')
const returnDepositsWithdrawals = require('./impl')
const c = require('../../poloConstants')

test.serial(t => {

  let actual, expected

  engine.brainWipe()

  // The API parameters should be in the request object.  Let's make a mockRequest
  let mockRequest = {body: {}}

  // 1. No params or only one. Yes, this seems like an odd reply.
  actual = returnDepositsWithdrawals(mockRequest, engine)
  expected = {'error': c.returnDepositsWithdrawals.INVALID_API_KEY_SECRET_PAIR}
  t.deepEqual(actual, expected)

  mockRequest = {body: {start: 5}}
  actual = returnDepositsWithdrawals(mockRequest, engine)
  expected = {'error': c.returnDepositsWithdrawals.INVALID_API_KEY_SECRET_PAIR}
  t.deepEqual(actual, expected)

  mockRequest = {body: {end: 5}}
  actual = returnDepositsWithdrawals(mockRequest, engine)
  expected = {'error': c.returnDepositsWithdrawals.INVALID_API_KEY_SECRET_PAIR}
  t.deepEqual(actual, expected)

  // 2. Start and end must be integers
  mockRequest = {body: {start: 'a', end: -1}}
  actual = returnDepositsWithdrawals(mockRequest, engine)
  expected = {'error': c.returnDepositsWithdrawals.INVALID_START_PARAMETER}
  t.deepEqual(actual, expected)

  mockRequest = {body: {start: -1, end: 'a'}}
  actual = returnDepositsWithdrawals(mockRequest, engine)
  expected = {'error': c.returnDepositsWithdrawals.INVALID_END_PARAMETER}
  t.deepEqual(actual, expected)

  // 3. Find a range with no activity
  mockRequest = {headers:{key: 'me'}, body: {start: -1, end: -1}}
  actual = returnDepositsWithdrawals(mockRequest, engine)
  expected = { deposits: [], withdrawals: [] }
  t.deepEqual(actual, expected)
})

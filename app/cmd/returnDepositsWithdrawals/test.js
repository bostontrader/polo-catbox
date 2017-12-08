const test = require('ava')
const engine = require('../../engine/tradeEngine')
const returnDepositsWithdrawals = require('./impl')
const c = require('../../poloConstants')

test(t => {
  let actual, expected
  let mockRequestBody = {}

  engine.brainWipe()

  // 1. No params or only one. Yes, this seems like an odd reply.
  actual = returnDepositsWithdrawals('key', mockRequestBody, engine)
  expected = {'error': c.returnDepositsWithdrawals.INVALID_API_KEY_SECRET_PAIR}
  t.deepEqual(actual, expected)

  mockRequestBody = {start: 5}
  actual = returnDepositsWithdrawals('key', mockRequestBody, engine)
  expected = {'error': c.returnDepositsWithdrawals.INVALID_API_KEY_SECRET_PAIR}
  t.deepEqual(actual, expected)

  mockRequestBody = {end: 5}
  actual = returnDepositsWithdrawals('key', mockRequestBody, engine)
  expected = {'error': c.returnDepositsWithdrawals.INVALID_API_KEY_SECRET_PAIR}
  t.deepEqual(actual, expected)

  // 2. Start and end must be integers
  mockRequestBody = {start: 'a', end: -1}
  actual = returnDepositsWithdrawals('key', mockRequestBody, engine)
  expected = {'error': c.returnDepositsWithdrawals.INVALID_START_PARAMETER}
  t.deepEqual(actual, expected)

  mockRequestBody = {start: -1, end: 'a'}
  actual = returnDepositsWithdrawals('key', mockRequestBody, engine)
  expected = {'error': c.returnDepositsWithdrawals.INVALID_END_PARAMETER}
  t.deepEqual(actual, expected)
})

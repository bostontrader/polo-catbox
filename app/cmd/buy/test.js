const test = require('ava')
const config = require('config')

const buy = require('./impl')
const engine = require('../../engine/tradeEngine')
const c = require('../../poloConstants')

test(t => {
  let actual, expected
  let mockRequestBody

  engine.brainWipe()

  // The API parameters should be in the request object.  Let's make a mockRequest
  mockRequestBody = {}

  // 1. No params. Yes, this seems like an odd reply.
  actual = buy('key', mockRequestBody, engine)
  expected = {error: c.buy.TOTAL_MUST_BE_AT_LEAST_0_0001}
  t.deepEqual(actual, expected)

  // 2. Rate
  mockRequestBody = {rate: 'a'}
  actual = buy('key', mockRequestBody, engine)
  expected = {error: c.buy.INVALID_RATE_PARAMETER}
  t.deepEqual(actual, expected)

  mockRequestBody = {rate: -1}
  actual = buy('key', mockRequestBody, engine)
  expected = {error: c.buy.INVALID_RATE_PARAMETER}
  t.deepEqual(actual, expected)

  // 3. Amount
  mockRequestBody = {amount: 'a'}
  actual = buy('key', mockRequestBody, engine)
  expected = {error: c.buy.INVALID_AMOUNT_PARAMETER}
  t.deepEqual(actual, expected)

  mockRequestBody = {amount: -1}
  actual = buy('key', mockRequestBody, engine)
  expected = {error: c.buy.INVALID_AMOUNT_PARAMETER}
  t.deepEqual(actual, expected)

  // 4. Rate x Amount < 0.0001
  mockRequestBody = {amount: 0.5, rate: 0.0001}
  actual = buy('key', mockRequestBody, engine)
  expected = {error: c.buy.TOTAL_MUST_BE_AT_LEAST_0_0001}
  t.deepEqual(actual, expected)

  // 5. Rate x Amount === 0.0001
  mockRequestBody = {amount: 1, rate: 0.0001}
  actual = buy('key', mockRequestBody, engine)
  expected = {error: c.buy.REQUIRED_PARAMETER_MISSING}
  t.deepEqual(actual, expected)

  // 6. currencyPair is not in the market
  mockRequestBody = {currencyPair: 'catfood', amount: 1, rate: 0.0001}
  actual = buy('key', mockRequestBody, engine)
  expected = {error: c.buy.INVALID_CURRENCY_PAIR_PARAMETER}
  t.deepEqual(actual, expected)

  // 7. no more than 1 of fillOrKill, immediateOrCancel, postOnly shall be set.  Go through the 8 permutations.

  // 7.1 None set.  Been there done that.

  // 7.2
  mockRequestBody = {currencyPair: config.get('testData.markets')[0], amount: 1, rate: 0.0001, postOnly: 1}
  actual = buy('key', mockRequestBody, engine)
  // expected = {error: c.INVALID_CURRENCY_PAIR_PARAMETER} sb ok
  // t.deepEqual(actual, expected)

  // 7.3
  mockRequestBody = {currencyPair: config.get('testData.markets')[0], amount: 1, rate: 0.0001, immediateOrCancel: 1}
  actual = buy('key', mockRequestBody, engine)
  // expected = {error: c.INVALID_CURRENCY_PAIR_PARAMETER} sb ok
  // t.deepEqual(actual, expected)

  // 7.4
  mockRequestBody = {currencyPair: config.get('testData.markets')[0], amount: 1, rate: 0.0001, immediateOrCancel: 1, postOnly: 1}
  actual = buy('key', mockRequestBody, engine)
  expected = {error: c.buy.NO_MORE_THAN_ONE}
  t.deepEqual(actual, expected)

  // 7.5
  mockRequestBody = {currencyPair: config.get('testData.markets')[0], amount: 1, rate: 0.0001, fillOrKill: 1}
  actual = buy('key', mockRequestBody, engine)
  // expected = {error: c.INVALID_CURRENCY_PAIR_PARAMETER} sb ok
  // t.deepEqual(actual, expected)

  // 7.6
  mockRequestBody = {currencyPair: config.get('testData.markets')[0], amount: 1, rate: 0.0001, fillOrKill: 1, postOnly: 1}
  actual = buy('key', mockRequestBody, engine)
  expected = {error: c.buy.NO_MORE_THAN_ONE}
  t.deepEqual(actual, expected)

  // 7.7
  mockRequestBody = {currencyPair: config.get('testData.markets')[0], amount: 1, rate: 0.0001, fillOrKill: 1, immediateOrCancel: 1}
  actual = buy('key', mockRequestBody, engine)
  expected = {error: c.buy.NO_MORE_THAN_ONE}
  t.deepEqual(actual, expected)

  // 7.8
  mockRequestBody = {currencyPair: config.get('testData.markets')[0], amount: 1, rate: 0.0001, fillOrKill: 1, immediateOrCancel: 1, postOnly: 1}
  actual = buy('key', mockRequestBody, engine)
  expected = {error: c.buy.NO_MORE_THAN_ONE}
  t.deepEqual(actual, expected)
})

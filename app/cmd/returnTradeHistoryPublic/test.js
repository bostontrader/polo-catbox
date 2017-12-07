const test = require('ava')
const config = require('config')
const engine = require('../../engine/tradeEngine')
const returnTradeHistoryPublic = require('./impl')
const c = require('../../poloConstants')

test(t => {
  let actual, expected
  let mockRequestBody

  engine.brainWipe()

  // 1. No params.
  mockRequestBody = {}
  actual = returnTradeHistoryPublic(mockRequestBody, engine)
  expected = {'error': c.PLEASE_SPECIFY_A_CURRENCY_PAIR}
  t.deepEqual(actual, expected)

  // 2. The currencyPair must be in the list of markets
  mockRequestBody = {currenyPair: 'catfood'}
  actual = returnTradeHistoryPublic(mockRequestBody, engine)
  expected = {'error': c.INVALID_CURRENCY_PAIR}
  t.deepEqual(actual, expected)

  // 3. Whichever numeric parameter is not an integer is bad.
  mockRequestBody = {currencyPair: config.get('testData.markets')[0], start: 'a'}
  actual = returnTradeHistoryPublic(mockRequestBody, engine)
  expected = {'error': c.returnTradeHistoryPublic.INVALID_START_TIME}
  t.deepEqual(actual, expected)

  mockRequestBody = {currencyPair: config.get('testData.markets')[0], end: 'a'}
  actual = returnTradeHistoryPublic(mockRequestBody, engine)
  expected = {'error': c.returnTradeHistoryPublic.INVALID_END_TIME}
  t.deepEqual(actual, expected)

  // 4. No negative integer parameters
  mockRequestBody = {currencyPair: config.get('testData.markets')[0], start: '-1'}
  actual = returnTradeHistoryPublic(mockRequestBody, engine)
  expected = {'error': c.returnTradeHistoryPublic.INVALID_START_TIME}
  t.deepEqual(actual, expected)

  mockRequestBody = {currencyPair: config.get('testData.markets')[0], end: '-1'}
  actual = returnTradeHistoryPublic(mockRequestBody, engine)
  expected = {'error': c.returnTradeHistoryPublic.INVALID_END_TIME}
  t.deepEqual(actual, expected)

  // {currencyPair: config.get('testData.markets')[0], start: '-1'}
  // {"error":"Please specify a time window of no more than 1 month."}
  // no more than 50000

  // If there are really any relevant trades in the history, and the parameters are properly set, then testing that is a job for the Engine's implementation of returnTradeHistoryPublic */
})

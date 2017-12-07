const test = require('ava')
const config = require('config')
const engine = require('../../engine/tradeEngine')
const returnOrderBook = require('./impl')
const c = require('../../poloConstants')

test(t => {
  let actual, expected

  // The API parameters should be in the request object body.  Let's make a mockRequestBody.
  let mockRequestBody = {}

  // 1. No params.
  actual = returnOrderBook(mockRequestBody, engine)
  expected = {'error': c.PLEASE_SPECIFY_A_CURRENCY_PAIR}
  t.deepEqual(actual, expected)

  // 2. Invalid currency pair.
  mockRequestBody = {currencyPair: 'catfood'}
  actual = returnOrderBook(mockRequestBody, engine)
  expected = {'error': c.INVALID_CURRENCY_PAIR}
  t.deepEqual(actual, expected)

  // 3. One valid currencyPair, depth === 0.
  mockRequestBody = {currencyPair: config.get('testData.markets')[0], depth: 0}
  engine.desiredOrderBookSeq = 888
  actual = returnOrderBook(mockRequestBody, engine)
  expected = {'asks': [], 'bids': [], 'isFrozen': '0', 'seq': 888}
  t.deepEqual(actual, expected)

  // 4. Valid currencyPair, invalid depth.
  mockRequestBody = {currencyPair: config.get('testData.markets')[0], depth: 'a'}
  actual = returnOrderBook(mockRequestBody, engine)
  expected = {'error': c.INVALID_DEPTH}
  t.deepEqual(actual, expected)

  // 5. Valid currencyPair, default depth.  This can't actually measure the default depth assigned.  That's a job for the engine tests.  But this _can_ determine that the absence of the parameter did not cause some other error.
  mockRequestBody = {currencyPair: config.get('testData.markets')[0]}
  engine.desiredOrderBookSeq = 888
  actual = returnOrderBook(mockRequestBody, engine)
  expected = {'asks': [], 'bids': [], 'isFrozen': '0', 'seq': 888}
  t.deepEqual(actual, expected)

  // 6. currencyPair = 'all', default depth.
  mockRequestBody = {currencyPair: 'all'}
  engine.desiredOrderBookSeq = 888
  actual = returnOrderBook(mockRequestBody, engine)

  expected = {}
  config.get('testData.markets').forEach(market => {
    expected[market] = {'asks': [], 'bids': [], 'isFrozen': '0', 'seq': 888}
  })

  t.deepEqual(actual, expected)
})

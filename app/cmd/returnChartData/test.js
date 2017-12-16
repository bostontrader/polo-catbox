const test = require('ava')
const config = require('config')
const returnChartData = require('./impl')
const engine = require('../../engine/tradeEngine')
const c = require('../../poloConstants')

test(t => {
  let actual, expected
  let mockRequestBody

  engine.brainWipe()

  // 1. Look for a correct period.
  mockRequestBody = {}
  actual = returnChartData(mockRequestBody, engine)
  expected = {error: c.returnChartData.PLEASE_SPECIFY_VALID_PERIOD}
  t.deepEqual(actual, expected)

  mockRequestBody = {period: 'a'}
  actual = returnChartData(mockRequestBody, engine)
  expected = {error: c.returnChartData.PLEASE_SPECIFY_VALID_PERIOD}
  t.deepEqual(actual, expected)

  mockRequestBody = {period: -1}
  actual = returnChartData(mockRequestBody, engine)
  expected = {error: c.returnChartData.PLEASE_SPECIFY_VALID_PERIOD}
  t.deepEqual(actual, expected)

  mockRequestBody = {period: 5}
  actual = returnChartData(mockRequestBody, engine)
  expected = {error: c.returnChartData.PLEASE_SPECIFY_VALID_PERIOD}
  t.deepEqual(actual, expected)

  // 2. Look for a correct currency pair
  mockRequestBody = {period: 300}
  actual = returnChartData(mockRequestBody, engine)
  expected = {error: c.returnChartData.PLEASE_SPECIFY_A_CURRENCY_PAIR}
  t.deepEqual(actual, expected)

  // The currencyPair must be in the list of markets
  mockRequestBody = {period: 900, currencyPair: 'catfood'}
  actual = returnChartData(mockRequestBody, engine)
  expected = {error: c.returnChartData.INVALID_CURRENCY_PAIR}
  t.deepEqual(actual, expected)

  // 3. Look for a correct start time
  mockRequestBody = {period: 1800, currencyPair: config.get('testData.markets')[0]}
  actual = returnChartData(mockRequestBody, engine)
  expected = {error: c.returnChartData.INVALID_START_TIME}
  t.deepEqual(actual, expected)

  mockRequestBody = {period: 7200, currencyPair: config.get('testData.markets')[0], start: 'a'}
  actual = returnChartData(mockRequestBody, engine)
  expected = {error: c.returnChartData.INVALID_START_TIME}
  t.deepEqual(actual, expected)

  mockRequestBody = {period: 14400, currencyPair: config.get('testData.markets')[0], start: -1}
  actual = returnChartData(mockRequestBody, engine)
  expected = {error: c.returnChartData.INVALID_START_TIME}
  t.deepEqual(actual, expected)

  // This is ok and will go all the way through to the engine.  Should return all data.
  mockRequestBody = {period: 86400, currencyPair: config.get('testData.markets')[0], start: 0}
  actual = returnChartData(mockRequestBody, engine)
  expected = [{date: 0, high: 0, low: 0, open: 0, close: 0, volume: 0, quoteVolume: 0, weightedAverage: 0}]
  t.deepEqual(actual, expected)

  // 4. Look for a correct end time
  mockRequestBody = {period: 86400, currencyPair: config.get('testData.markets')[0], start: 0, end: 'a'}
  actual = returnChartData(mockRequestBody, engine)
  expected = {error: c.returnChartData.INVALID_END_TIME}
  t.deepEqual(actual, expected)

  mockRequestBody = {period: 86400, currencyPair: config.get('testData.markets')[0], start: 0, end: -1}
  actual = returnChartData(mockRequestBody, engine)
  expected = {error: c.returnChartData.INVALID_END_TIME}
  t.deepEqual(actual, expected)

  // This is ok and will go all the way through to the engine.
  mockRequestBody = {period: 86400, currencyPair: config.get('testData.markets')[0], start: 0, end: 0}
  actual = returnChartData(mockRequestBody, engine)
  expected = [{date: 0, high: 0, low: 0, open: 0, close: 0, volume: 0, quoteVolume: 0, weightedAverage: 0}]
  t.deepEqual(actual, expected)

  // This is also ok.
  mockRequestBody = {period: 86400, currencyPair: config.get('testData.markets')[0], start: 2000, end: 1000}
  actual = returnChartData(mockRequestBody, engine)
  expected = [{date: 0, high: 0, low: 0, open: 0, close: 0, volume: 0, quoteVolume: 0, weightedAverage: 0}]
  t.deepEqual(actual, expected)
})

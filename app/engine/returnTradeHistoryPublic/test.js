const test = require('ava')
const config = require('config')

const engine = require('../tradeEngine')

const tradeDate1 = 86400 // 1970-01-02 00:00:00
const tradeDate2 = 108000 // 1970-01-02 06:00:00

// 1. A market with zero trades is something we'll never likely see in the wild.  Nevertheless, for purposes of completeness, I will venture a guess as to a reasonable reply.
test.serial(t => {
  engine.brainWipe()
  const actual = engine.returnTradeHistoryPublic(config.get('testData.markets')[0], 0, 9999999999)
  const expected = []
  t.deepEqual(actual, expected)
})

// 2. A market with a single trade.
test.serial(t => {
  engine.brainWipe()

  const currencyPair = config.get('testData.markets')[0]
  engine.sell({apiKey: 'others', currencyPair, dt: 1000, rate: 0.015, amount: 2.0})
  engine.desiredTradeDate = tradeDate1
  engine.buy({apiKey: 'others', currencyPair, dt: tradeDate1, rate: 0.015, amount: 1.5})

  const actual = engine.returnTradeHistoryPublic(currencyPair, 0, 9999999999)
  const expected = [
    {globalTradeID: 240000000, tradeID: '1', date: engine.desiredTradeDate, type: 'buy', rate: 0.015, amount: 1.5, total: 0.0225}
  ]
  t.deepEqual(actual, expected)
})

// 3. A market with a two trades.
test.serial(t => {
  engine.brainWipe()

  const currencyPair = config.get('testData.markets')[0]
  engine.sell({apiKey: 'others', currencyPair, dt: 1000, rate: 0.015, amount: 2.0})

  // const desiredTradeDate1 = tradeDate1
  engine.desiredTradeDate = tradeDate1
  engine.buy({apiKey: 'others', currencyPair, dt: tradeDate1, rate: 0.015, amount: 1.5})

  // const desiredTradeDate2 = tradeDate2
  engine.desiredTradeDate = tradeDate2
  engine.buy({apiKey: 'others', currencyPair, dt: tradeDate2, rate: 0.015, amount: 0.25})

  const actual = engine.returnTradeHistoryPublic(currencyPair, 0, 9999999999)
  const expected = [
    {globalTradeID: 240000000, tradeID: '1', date: tradeDate1, type: 'buy', rate: 0.015, amount: 1.5, total: 0.0225},
    {globalTradeID: 240000000, tradeID: '1', date: tradeDate2, type: 'buy', rate: 0.015, amount: 0.25, total: 0.00375}
  ]
  t.deepEqual(actual, expected)
})

// 4. Two markets with two trades each.
test.serial(t => {
  engine.brainWipe()

  let currencyPair = config.get('testData.markets')[0]
  engine.sell({apiKey: 'others', currencyPair, dt: 1000, rate: 0.015, amount: 2.0})
  engine.buy({apiKey: 'others', currencyPair, dt: 1000, rate: 0.015, amount: 1.5})
  engine.buy({apiKey: 'others', currencyPair, dt: 1000, rate: 0.015, amount: 0.25})

  currencyPair = config.get('testData.markets')[1]
  engine.sell({apiKey: 'others', currencyPair, dt: 1000, rate: 0.15, amount: 4.0})

  engine.desiredTradeDate = tradeDate1
  engine.buy({apiKey: 'others', currencyPair, dt: tradeDate1, rate: 0.15, amount: 2.5})

  engine.desiredTradeDate = tradeDate2
  engine.buy({apiKey: 'others', currencyPair, dt: tradeDate2, rate: 0.15, amount: 0.4})

  const actual = engine.returnTradeHistoryPublic(currencyPair, 0, 9999999999)
  const expected = [
    {globalTradeID: 240000000, tradeID: '1', date: tradeDate1, type: 'buy', rate: 0.15, amount: 2.5, total: 0.375},
    {globalTradeID: 240000000, tradeID: '1', date: tradeDate2, type: 'buy', rate: 0.15, amount: 0.4, total: 0.06}
  ]
  t.deepEqual(actual, expected)
})

test.serial(t => {
  let actual, expected
  const currencyPair = config.get('testData.markets')[0]

  engine.brainWipe()

  // 1. In the beginning, there are no trades.
  actual = engine.returnTradeHistoryPublic(currencyPair, 0, 9999999999)
  expected = []
  t.deepEqual(actual, expected)

  // 2. Now make a single trade and verify that it is in the history.

  // 2.1 First submit an order to buy and then an order to sell. Doing so will trigger a trade.
  engine.buy({apiKey: 'others', currencyPair, dt: 2000, rate: 0.018, amount: 2.0, postOnly: 1})
  engine.desiredTradeDate = tradeDate1
  engine.sell({apiKey: 'me', currencyPair, dt: tradeDate1, rate: 0.017, amount: 2.0})

  // 2.1 start < end < tradeDate1
  actual = engine.returnTradeHistoryPublic(currencyPair, tradeDate1 - 2, tradeDate1 - 1)
  expected = []
  t.deepEqual(actual, expected)

  // 2.2 start < end === tradeDate1.
  actual = engine.returnTradeHistoryPublic(currencyPair, tradeDate1 - 1, tradeDate1)
  expected = [
    {globalTradeID: 240000000, tradeID: '1', date: tradeDate1, type: 'sell', rate: 0.018, amount: 2, total: 0.036}
  ]
  t.deepEqual(actual, expected)

  // 2.3 start < tradeDate1 < end
  actual = engine.returnTradeHistoryPublic(currencyPair, tradeDate1 - 1, tradeDate1 + 1)
  expected = [
    {globalTradeID: 240000000, tradeID: '1', date: tradeDate1, type: 'sell', rate: 0.018, amount: 2, total: 0.036}
  ]
  t.deepEqual(actual, expected)

  // 3. Make a second trade for the same currency.  This time make it a 'buy'.
  engine.sell({apiKey: 'others', currencyPair: 'BTC_LTC', dt: 2000, rate: 0.017, amount: 3.0})
  engine.desiredTradeDate = tradeDate2
  engine.buy({apiKey: 'me', currencyPair: 'BTC_LTC', dt: tradeDate2, rate: 0.018, amount: 3.0})

  // 3.1 start < first trade date, end === 1st trade date.  Only one trade.
  actual = engine.returnTradeHistoryPublic(currencyPair, tradeDate1 - 1, tradeDate1)
  expected = [
    {globalTradeID: 240000000, tradeID: '1', date: tradeDate1, type: 'sell', rate: 0.018, amount: 2, total: 0.036}
  ]
  t.deepEqual(actual, expected)

  // 3.2 start < 1st trade date, 1st trade date < 2nd trade date && end < 2nd trade date.  Only one trade.
  actual = engine.returnTradeHistoryPublic(currencyPair, tradeDate1 - 1, tradeDate2 - 1)
  expected = [
    {globalTradeID: 240000000, tradeID: '1', date: tradeDate1, type: 'sell', rate: 0.018, amount: 2, total: 0.036}
  ]
  t.deepEqual(actual, expected)

  // 3.3 start < 1st trade date, end === 2nd trade date, two trades.
  actual = engine.returnTradeHistoryPublic(currencyPair, tradeDate1 - 1, tradeDate2)
  expected = [
    {globalTradeID: 240000000, tradeID: '1', date: tradeDate1, type: 'sell', rate: 0.018, amount: 2, total: 0.036},
    {globalTradeID: 240000000, tradeID: '1', date: tradeDate2, type: 'buy', rate: 0.017, amount: 3, total: 0.051000000000000004}
  ]
  t.deepEqual(actual, expected)

  // 3.4 start < 1st trade date, 2nd trade date < end.  two trades.
  actual = engine.returnTradeHistoryPublic(currencyPair, tradeDate1 - 1, tradeDate2 + 1)
  expected = [
    {globalTradeID: 240000000, tradeID: '1', date: tradeDate1, type: 'sell', rate: 0.018, amount: 2, total: 0.036},
    {globalTradeID: 240000000, tradeID: '1', date: tradeDate2, type: 'buy', rate: 0.017, amount: 3, total: 0.051000000000000004}
  ]
  t.deepEqual(actual, expected)

  // 3.5 start === 1st trade date, 2nd date < end.  two trades.
  actual = engine.returnTradeHistoryPublic(currencyPair, tradeDate1, tradeDate2 + 1)
  expected = [
    {globalTradeID: 240000000, tradeID: '1', date: tradeDate1, type: 'sell', rate: 0.018, amount: 2, total: 0.036},
    {globalTradeID: 240000000, tradeID: '1', date: tradeDate2, type: 'buy', rate: 0.017, amount: 3, total: 0.051000000000000004}
  ]
  t.deepEqual(actual, expected)

  // 3.6 1st trade date < start, 2nd trade date < end.  last trade.
  actual = engine.returnTradeHistoryPublic(currencyPair, tradeDate1 + 1, tradeDate2 + 1)
  expected = [
    {globalTradeID: 240000000, tradeID: '1', date: tradeDate2, type: 'buy', rate: 0.017, amount: 3, total: 0.051000000000000004}
  ]
  t.deepEqual(actual, expected)

  // 3.7 start === 2nd trade date, 2nd trade date < end. last trade.
  actual = engine.returnTradeHistoryPublic(currencyPair, tradeDate2, tradeDate2 + 1)
  expected = [
    {globalTradeID: 240000000, tradeID: '1', date: tradeDate2, type: 'buy', rate: 0.017, amount: 3, total: 0.051000000000000004}
  ]
  t.deepEqual(actual, expected)

  // 3.8 start and end are after both trades.  empty
  actual = engine.returnTradeHistoryPublic(currencyPair, tradeDate2 + 1, tradeDate2 + 2)
  expected = []
  t.deepEqual(actual, expected)
})

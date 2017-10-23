// This is a test of returnTradeHistory when talking directly to the tradeEngine.
const test = require('ava')
const config = require('config')

const engine = require('../tradeEngine')

// 1. A market with zero trades is something we'll never likely see in the wild.  Nevertheless, for purposes of completeness, I will venture a guess as to a reasonable reply.
test.serial(t => {
  engine.brainWipe()
  const actual = engine.returnTradeHistory(config.get('testData.markets')[0])
  const expected = []

  t.deepEqual(actual, expected)
})

// 2. A market with a single trade.
test.serial(t => {
  engine.brainWipe()

  const currencyPair = config.get('testData.markets')[0]
  engine.sell({apiKey: 'others', currencyPair, dt: 1000, rate: 0.015, amount: 2.0})
  engine.desiredTradeDate = Date.parse('2017-10-15 12:00:00')
  engine.buy({apiKey: 'others', currencyPair, dt: engine.desiredTradeDate, rate: 0.015, amount: 1.5})

  const actual = engine.returnTradeHistory(currencyPair)
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

  const desiredTradeDate1 = Date.parse('2017-10-15 12:00:00')
  engine.desiredTradeDate = desiredTradeDate1
  engine.buy({apiKey: 'others', currencyPair, dt: desiredTradeDate1, rate: 0.015, amount: 1.5})

  const desiredTradeDate2 = Date.parse('2017-10-15 12:00:01')
  engine.desiredTradeDate = desiredTradeDate2
  engine.buy({apiKey: 'others', currencyPair, dt: desiredTradeDate2, rate: 0.015, amount: 0.25})

  const actual = engine.returnTradeHistory(currencyPair)
  const expected = [
    {globalTradeID: 240000000, tradeID: '1', date: desiredTradeDate1, type: 'buy', rate: 0.015, amount: 1.5, total: 0.0225},
    {globalTradeID: 240000000, tradeID: '1', date: desiredTradeDate2, type: 'buy', rate: 0.015, amount: 0.25, total: 0.00375}
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

  const desiredTradeDate1 = Date.parse('2017-10-15 12:00:00')
  engine.desiredTradeDate = desiredTradeDate1
  engine.buy({apiKey: 'others', currencyPair, dt: desiredTradeDate1, rate: 0.15, amount: 2.5})

  const desiredTradeDate2 = Date.parse('2017-10-15 12:00:01')
  engine.desiredTradeDate = desiredTradeDate2
  engine.buy({apiKey: 'others', currencyPair, dt: desiredTradeDate2, rate: 0.15, amount: 0.4})

  const actual = engine.returnTradeHistory(currencyPair)
  const expected = [
    {globalTradeID: 240000000, tradeID: '1', date: desiredTradeDate1, type: 'buy', rate: 0.15, amount: 2.5, total: 0.375},
    {globalTradeID: 240000000, tradeID: '1', date: desiredTradeDate2, type: 'buy', rate: 0.15, amount: 0.4, total: 0.06}
  ]
  t.deepEqual(actual, expected)
})

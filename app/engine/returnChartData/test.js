// This is a test of returnTradeHistory when talking directly to the tradeEngine.
const test = require('ava')
const config = require('config')

const engine = require('../tradeEngine')

// 1. A market with zero trades is something we'll never likely see in the wild.  Nevertheless, for purposes of completeness, I will venture a guess as to a reasonable reply.
test.serial(t => {
  engine.brainWipe()
  const actual = engine.returnChartData(config.get('testData.markets')[0])
  const expected = []

  t.deepEqual(actual, expected)
})

// 2. A market with all trades outside the time range.
test.serial(t => {
  engine.brainWipe()

  const currencyPair = config.get('testData.markets')[0]
  engine.sell({apiKey: 'others', currencyPair, dt: 1000, rate: 0.015, amount: 2.0})
  const desiredTradeDate = Date.parse('2017-10-15 12:00:00')
  engine.desiredTradeDate = desiredTradeDate
  engine.buy({apiKey: 'others', currencyPair, dt: desiredTradeDate, rate: 0.015, amount: 1.5})

  const actual = engine.returnChartData(currencyPair, Date.parse('2017-10-16 12:00:00'), Date.parse('2017-10-17 12:00:00'), 900 * 1000)
  const expected = []

  t.deepEqual(actual, expected)
})

// 2. A market with one trade inside one time period.
test.serial(t => {
  engine.brainWipe()

  const currencyPair = config.get('testData.markets')[0]
  engine.sell({apiKey: 'others', currencyPair, dt: 1000, rate: 0.015, amount: 2.0})
  const desiredTradeDate = Date.parse('2017-10-15 12:00:00')
  engine.desiredTradeDate = desiredTradeDate
  engine.buy({apiKey: 'others', currencyPair, dt: desiredTradeDate, rate: 0.015, amount: 1.5})

  const start = Date.parse('2017-10-15 11:50:00')
  const actual = engine.returnChartData(currencyPair, start, Date.parse('2017-10-15 12:01:00'), 900 * 1000)
  const expected = [{
    date: 1508039400000,
    high: 0.015,
    low: 0.015,
    open: 0.015,
    close: 0.015,
    volume: 0.0225,
    quoteVolume: 1.5,
    weightedAverage: 0.015}]

  t.deepEqual(actual, expected)
})

// 2. A market with two trades inside one time period.
test.serial(t => {
  engine.brainWipe()

  const currencyPair = config.get('testData.markets')[0]
  engine.sell({apiKey: 'others', currencyPair, dt: 1000, rate: 0.015, amount: 2.0})
  engine.sell({apiKey: 'others', currencyPair, dt: 1000, rate: 0.016, amount: 3.0})

  const desiredTradeDate = Date.parse('2017-10-15 12:00:00')
  engine.desiredTradeDate = desiredTradeDate
  engine.buy({apiKey: 'others', currencyPair, dt: desiredTradeDate, rate: 0.015, amount: 2.0})
  engine.buy({apiKey: 'others', currencyPair, dt: desiredTradeDate, rate: 0.016, amount: 3.0})

  const start = Date.parse('2017-10-15 11:50:00')
  const actual = engine.returnChartData(currencyPair, start, Date.parse('2017-10-15 12:01:00'), 900 * 1000)
  const expected = [{
    date: 1508039400000,
    high: 0.016,
    low: 0.015,
    open: 0.015,
    close: 0.016,
    volume: 0.078,
    quoteVolume: 5,
    weightedAverage: 0.0156 }]

  t.deepEqual(actual, expected)
})

// 2. A market with two trades each inside two adjacent time periods.
test.serial(t => {
  engine.brainWipe()

  const currencyPair = config.get('testData.markets')[0]
  engine.sell({apiKey: 'others', currencyPair, dt: 1000, rate: 0.015, amount: 2.0})
  engine.sell({apiKey: 'others', currencyPair, dt: 1000, rate: 0.016, amount: 3.0})
  engine.sell({apiKey: 'others', currencyPair, dt: 1000, rate: 0.020, amount: 2.0})
  engine.sell({apiKey: 'others', currencyPair, dt: 1000, rate: 0.022, amount: 3.0})

  const start = Date.parse('2017-10-15 11:50:00')
  const end = Date.parse('2017-10-15 12:10:00')

  let desiredTradeDate

  // Trades inside period 1
  desiredTradeDate = Date.parse('2017-10-15 12:00:00')
  engine.desiredTradeDate = desiredTradeDate
  engine.buy({apiKey: 'others', currencyPair, dt: desiredTradeDate, rate: 0.015, amount: 2.0})
  engine.buy({apiKey: 'others', currencyPair, dt: desiredTradeDate, rate: 0.016, amount: 3.0})

  // Trades inside period 2
  desiredTradeDate = Date.parse('2017-10-15 12:08:00')
  engine.desiredTradeDate = desiredTradeDate
  engine.buy({apiKey: 'others', currencyPair, dt: desiredTradeDate, rate: 0.020, amount: 2.0})
  engine.buy({apiKey: 'others', currencyPair, dt: desiredTradeDate, rate: 0.022, amount: 3.0})

  const actual = engine.returnChartData(currencyPair, start, end, 900 * 1000)
  const expected = [
    {
      date: 1508039400000,
      high: 0.016,
      low: 0.015,
      open: 0.015,
      close: 0.016,
      volume: 0.078,
      quoteVolume: 5,
      weightedAverage: 0.0156
    },
    {
      date: 1508040300000,
      high: 0.022,
      low: 0.02,
      open: 0.02,
      close: 0.022,
      volume: 0.10600000000000001,
      quoteVolume: 5,
      weightedAverage: 0.021200000000000004
    }
  ]

  t.deepEqual(actual, expected)
})

// 2. A market with two trades each inside two time periods, with said periods separated with a single empty period.
test.serial(t => {
  engine.brainWipe()

  const currencyPair = config.get('testData.markets')[0]
  engine.sell({apiKey: 'others', currencyPair, dt: 1000, rate: 0.015, amount: 2.0})
  engine.sell({apiKey: 'others', currencyPair, dt: 1000, rate: 0.016, amount: 3.0})
  engine.sell({apiKey: 'others', currencyPair, dt: 1000, rate: 0.020, amount: 2.0})
  engine.sell({apiKey: 'others', currencyPair, dt: 1000, rate: 0.022, amount: 3.0})

  const start = Date.parse('2017-10-15 11:50:00')
  const end = Date.parse('2017-10-15 12:25:00')

  let desiredTradeDate

  // Trades inside period 1
  desiredTradeDate = Date.parse('2017-10-15 12:00:00')
  engine.desiredTradeDate = desiredTradeDate
  engine.buy({apiKey: 'others', currencyPair, dt: desiredTradeDate, rate: 0.015, amount: 2.0})
  engine.buy({apiKey: 'others', currencyPair, dt: desiredTradeDate, rate: 0.016, amount: 3.0})

  // period 2 is empty

  // Trades inside period 3
  desiredTradeDate = Date.parse('2017-10-15 12:22:00')
  engine.desiredTradeDate = desiredTradeDate
  engine.buy({apiKey: 'others', currencyPair, dt: desiredTradeDate, rate: 0.020, amount: 2.0})
  engine.buy({apiKey: 'others', currencyPair, dt: desiredTradeDate, rate: 0.022, amount: 3.0})

  const actual = engine.returnChartData(currencyPair, start, end, 900 * 1000)
  const expected = [
    {
      date: 1508039400000,
      high: 0.016,
      low: 0.015,
      open: 0.015,
      close: 0.016,
      volume: 0.078,
      quoteVolume: 5,
      weightedAverage: 0.0156
    },
    {
      date: 1508040300000,
      high: undefined,
      low: undefined,
      open: undefined,
      close: undefined,
      volume: 0,
      quoteVolume: 0,
      NaN: NaN
    },
    {
      date: 1508041200000,
      high: 0.022,
      low: 0.02,
      open: 0.02,
      close: 0.022,
      volume: 0.10600000000000001,
      quoteVolume: 5,
      weightedAverage: 0.021200000000000004
    }
  ]

  t.deepEqual(actual, expected)
})

// This is a test of returnTicker when talking directly to the tradeEngine.
const config = require('config')

const test = require('ava')

const engine = require('../tradeEngine')

// 1. A ticker for a market with zero trades is something we'll never likely see in the wild.  Nevertheless, for purposes of completeness, I will venture a guess as to a reasonable reply.
test.serial(t => {
  engine.brainWipe()
  const n = engine.returnTicker(config.get('testData.markets'))

  config.get('testData.markets').forEach(market => {
    const actual = n[market]
    delete actual.id
    const expected = {
      isFrozen: 0,
      lowestAsk: undefined,
      highestBid: undefined,
      last: undefined,
      percentChange: undefined,
      baseVolume: undefined,
      quoteVolume: undefined,
      high24hr: undefined,
      low24hr: undefined
    }

    t.deepEqual(actual, expected)
    delete n[market]
  })
  t.deepEqual(n, {}) // Verify that no other markets are in the ticker.
})

// 2. A ticker for a single market with only a single buy order.
test.serial(t => {
  engine.brainWipe()
  const currencyPair = config.get('testData.markets')[0]
  engine.buy({apiKey: 'others', currencyPair, 'dt': 1000, rate: 0.015, amount: 1.0})

  const actual = engine.returnTicker(config.get('testData.markets'))[currencyPair]
  delete actual.id
  const expected = {
    isFrozen: 0,
    lowestAsk: undefined,
    highestBid: 0.015,
    last: undefined,
    percentChange: undefined,
    baseVolume: undefined,
    quoteVolume: undefined,
    high24hr: undefined,
    low24hr: undefined
  }
  t.deepEqual(actual, expected)
})

// 3. A ticker for a single market with two buy orders. Does the highest bid sort to the top?
test.serial(t => {
  engine.brainWipe()
  const currencyPair = config.get('testData.markets')[0]
  engine.buy({apiKey: 'others', currencyPair, 'dt': 1000, rate: 0.015, amount: 1.0})
  engine.buy({apiKey: 'others', currencyPair, 'dt': 1000, rate: 0.016, amount: 1.0})
  const actual = engine.returnTicker(config.get('testData.markets'))[currencyPair]
  delete actual.id
  const expected = {
    isFrozen: 0,
    lowestAsk: undefined,
    highestBid: 0.016,
    last: undefined,
    percentChange: undefined,
    baseVolume: undefined,
    quoteVolume: undefined,
    high24hr: undefined,
    low24hr: undefined
  }
  t.deepEqual(actual, expected)
})

// 4. A ticker for a single market with only a single sell order.
test.serial(t => {
  engine.brainWipe()
  const currencyPair = config.get('testData.markets')[0]
  engine.sell({apiKey: 'others', currencyPair, 'dt': 1000, rate: 0.015, amount: 1.0})

  const actual = engine.returnTicker(config.get('testData.markets'))[currencyPair]
  delete actual.id
  const expected = {
    isFrozen: 0,
    lowestAsk: 0.015,
    highestBid: undefined,
    last: undefined,
    percentChange: undefined,
    baseVolume: undefined,
    quoteVolume: undefined,
    high24hr: undefined,
    low24hr: undefined
  }
  t.deepEqual(actual, expected)
})

// 5. A ticker for a single market with two sell orders. Does the lowest bid sort to the top?
test.serial(t => {
  engine.brainWipe()
  const currencyPair = config.get('testData.markets')[0]
  engine.sell({apiKey: 'others', currencyPair, 'dt': 1000, rate: 0.015, amount: 1.0})
  engine.sell({apiKey: 'others', currencyPair, 'dt': 1000, rate: 0.014, amount: 1.0})

  const actual = engine.returnTicker(config.get('testData.markets'))[currencyPair]
  delete actual.id
  const expected = {
    isFrozen: 0,
    lowestAsk: 0.014,
    highestBid: undefined,
    last: undefined,
    percentChange: undefined,
    baseVolume: undefined,
    quoteVolume: undefined,
    high24hr: undefined,
    low24hr: undefined
  }
  t.deepEqual(actual, expected)
})

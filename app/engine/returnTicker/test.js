// This is a test of returnTicker when talking directly to the tradeEngine.
const test = require('ava')
const config = require('config')

const engine = require('../tradeEngine')

let actual, expected

const currencyPair = config.get('testData.markets')[0]
const currencies = currencyPair.split('_')
const baseCurrency = currencies[0]
const quoteCurrency = currencies[1]

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

  // In order to buy or sell anything we must first ensure sufficient funds.
  engine.makeDeposit('others', baseCurrency, 100)

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

  // In order to buy or sell anything we must first ensure sufficient funds.
  engine.makeDeposit('others', baseCurrency, 100)

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

  // In order to buy or sell anything we must first ensure sufficient funds.
  engine.makeDeposit('others', quoteCurrency, 100)

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

  // In order to buy or sell anything we must first ensure sufficient funds.
  engine.makeDeposit('others', quoteCurrency, 100)

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

// 6. A single trade for a single market.
test.serial(t => {
  engine.brainWipe()

  // In order to buy or sell anything we must first ensure sufficient funds.
  engine.makeDeposit('others', baseCurrency, 100)
  engine.makeDeposit('others', quoteCurrency, 100)

  engine.buy({apiKey: 'others', currencyPair, 'dt': 1000, rate: 0.015, amount: 2.0})
  engine.sell({apiKey: 'others', currencyPair, 'dt': 1000, rate: 0.014, amount: 2.0})

  const actual = engine.returnTicker(config.get('testData.markets'))[currencyPair]
  delete actual.id
  const expected = {
    isFrozen: 0,
    lowestAsk: undefined,
    highestBid: undefined,
    last: 0.015,
    percentChange: undefined,
    baseVolume: 0.03,
    quoteVolume: 2,
    high24hr: 0.015,
    low24hr: 0.015
  }
  t.deepEqual(actual, expected)
})

// 7. Two trades for a single market.
test.serial(t => {
  engine.brainWipe()

  // In order to buy or sell anything we must first ensure sufficient funds.
  engine.makeDeposit('others', baseCurrency, 100)
  engine.makeDeposit('others', quoteCurrency, 100)

  engine.buy({apiKey: 'others', currencyPair, 'dt': 1000, rate: 0.015, amount: 2.0})
  engine.sell({apiKey: 'others', currencyPair, 'dt': 1000, rate: 0.014, amount: 2.0})
  engine.sell({apiKey: 'others', currencyPair, 'dt': 1000, rate: 0.016, amount: 2.0})
  engine.buy({apiKey: 'others', currencyPair, 'dt': 1000, rate: 0.017, amount: 2.0})

  const actual = engine.returnTicker(config.get('testData.markets'))[currencyPair]
  delete actual.id
  const expected = {
    isFrozen: 0,
    lowestAsk: undefined,
    highestBid: undefined,
    last: 0.016,
    percentChange: undefined,
    baseVolume: 0.062,
    quoteVolume: 4,
    high24hr: 0.016,
    low24hr: 0.015
  }
  t.deepEqual(actual, expected)
})

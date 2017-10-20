// This is a test of returnOrderBook when talking directly to the tradeEngine.
const test = require('ava')
const config = require('config')

const engine = require('../tradeEngine')

// 1. The order book for a market with zero orders is something we'll never likely see in the wild.  Nevertheless, for purposes of completeness, I will venture a guess as to a reasonable reply.
test.serial(t => {
  engine.brainWipe()
  const actual = engine.returnOrderBook()
  const expected = {}

  t.deepEqual(actual, expected)
})

// 2. A market with a single buy order.
test.serial(t => {
  engine.brainWipe()

  const currencyPair = config.get('testData.markets')[0]
  engine.buy({apiKey: 'others', currencyPair, 'dt': 1000, rate: 0.015, amount: 2.0})

  const actual = engine.returnOrderBook()
  const expected = {
    BTC_LTC: {
      asks: [],
      bids: [[0.015, 2]]
    }
  }
  t.deepEqual(actual, expected)
})

// 3. A market with a two buy orders at the same price.
test.serial(t => {
  engine.brainWipe()

  const currencyPair = config.get('testData.markets')[0]
  engine.buy({apiKey: 'others', currencyPair, 'dt': 1000, rate: 0.015, amount: 2.0})
  engine.buy({apiKey: 'others', currencyPair, 'dt': 1000, rate: 0.015, amount: 2.5})

  const actual = engine.returnOrderBook()
  const expected = {
    BTC_LTC: {
      asks: [],
      bids: [[0.015, 4.5]]
    }
  }
  t.deepEqual(actual, expected)
})

// 4. A market with a two buy orders at different prices.
test.serial(t => {
  engine.brainWipe()

  const currencyPair = config.get('testData.markets')[0]
  engine.buy({apiKey: 'others', currencyPair, 'dt': 1000, rate: 0.015, amount: 2.0})
  engine.buy({apiKey: 'others', currencyPair, 'dt': 1000, rate: 0.016, amount: 2.5})

  const actual = engine.returnOrderBook()
  const expected = {
    BTC_LTC: {
      asks: [],
      bids: [[0.016, 2.5], [0.015, 2.0]]
    }
  }
  t.deepEqual(actual, expected)
})

// 5. A market with a single sell order.
test.serial(t => {
  engine.brainWipe()

  const currencyPair = config.get('testData.markets')[0]
  engine.sell({apiKey: 'others', currencyPair, 'dt': 1000, rate: 0.015, amount: 2.0})

  const actual = engine.returnOrderBook()
  const expected = {
    BTC_LTC: {
      asks: [[0.015, 2]],
      bids: []
    }
  }
  t.deepEqual(actual, expected)
})

// 6. A market with a two sell orders at the same price.
test.serial(t => {
  engine.brainWipe()

  const currencyPair = config.get('testData.markets')[0]
  engine.sell({apiKey: 'others', currencyPair, 'dt': 1000, rate: 0.015, amount: 2.0})
  engine.sell({apiKey: 'others', currencyPair, 'dt': 1000, rate: 0.015, amount: 2.5})

  const actual = engine.returnOrderBook()
  const expected = {
    BTC_LTC: {
      asks: [[0.015, 4.5]],
      bids: []
    }
  }
  t.deepEqual(actual, expected)
})

// 7. A market with a two sell orders at different prices.
test.serial(t => {
  engine.brainWipe()

  const currencyPair = config.get('testData.markets')[0]
  engine.sell({apiKey: 'others', currencyPair, 'dt': 1000, rate: 0.015, amount: 2.0})
  engine.sell({apiKey: 'others', currencyPair, 'dt': 1000, rate: 0.016, amount: 2.5})

  const actual = engine.returnOrderBook()
  const expected = {
    BTC_LTC: {
      asks: [[0.015, 2.0], [0.016, 2.5]],
      bids: []
    }
  }
  t.deepEqual(actual, expected)
})

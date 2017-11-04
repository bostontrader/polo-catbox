const test = require('ava')
const config = require('config')

const engine = require('../tradeEngine')

// An empty array of trades.
test.serial(t => {
  engine.brainWipe()
  const actual = engine.returnCandleStick([])
  const expected = engine.undefinedCandleStick
  t.deepEqual(actual, expected)
})

const currencyPair = config.get('testData.markets')[0]

// A single trade.
test.serial(t => {
  engine.brainWipe()
  engine.sell({apiKey: 'me', currencyPair, dt: 1000, rate: 0.015, amount: 1})
  engine.buy({apiKey: 'me', currencyPair, dt: 1000, rate: 0.015, amount: 1})
  const actual = engine.returnCandleStick(engine.trades)
  const expected = { high: 0.015, low: 0.015, open: 0.015, close: 0.015, volume: 0.015, quoteVolume: 1, weightedAverage: 0.015 }
  t.deepEqual(actual, expected)
})

// Two trades at the same rate.
test.serial(t => {
  engine.brainWipe()
  engine.sell({apiKey: 'me', currencyPair, dt: 1000, rate: 0.015, amount: 2})
  engine.buy({apiKey: 'me', currencyPair, dt: 1000, rate: 0.015, amount: 1})
  engine.buy({apiKey: 'me', currencyPair, dt: 1000, rate: 0.015, amount: 1})

  const actual = engine.returnCandleStick(engine.trades)
  const expected = { high: 0.015, low: 0.015, open: 0.015, close: 0.015, volume: 0.03, quoteVolume: 2, weightedAverage: 0.015 }
  t.deepEqual(actual, expected)
})

// Two trades at differ ent rates, low rate first.
test.serial(t => {
  engine.brainWipe()
  engine.sell({apiKey: 'me', currencyPair, dt: 1000, rate: 0.012, amount: 1})
  engine.buy({apiKey: 'me', currencyPair, dt: 1000, rate: 0.012, amount: 1})
  engine.sell({apiKey: 'me', currencyPair, dt: 1000, rate: 0.015, amount: 1})
  engine.buy({apiKey: 'me', currencyPair, dt: 1000, rate: 0.015, amount: 1})

  const actual = engine.returnCandleStick(engine.trades)
  const expected = { high: 0.015, low: 0.012, open: 0.012, close: 0.015, volume: 0.027, quoteVolume: 2, weightedAverage: 0.0135 }
  t.deepEqual(actual, expected)
})

// Two trades at different rates, high rate first.
test.serial(t => {
  engine.brainWipe()
  engine.sell({apiKey: 'me', currencyPair, dt: 1000, rate: 0.015, amount: 1})
  engine.buy({apiKey: 'me', currencyPair, dt: 1000, rate: 0.015, amount: 1})
  engine.sell({apiKey: 'me', currencyPair, dt: 1000, rate: 0.012, amount: 1})
  engine.buy({apiKey: 'me', currencyPair, dt: 1000, rate: 0.012, amount: 1})

  const actual = engine.returnCandleStick(engine.trades)
  const expected = { high: 0.015, low: 0.012, open: 0.015, close: 0.012, volume: 0.027, quoteVolume: 2, weightedAverage: 0.0135 }
  t.deepEqual(actual, expected)
})

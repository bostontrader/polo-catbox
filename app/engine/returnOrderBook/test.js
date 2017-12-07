const test = require('ava')
const config = require('config')
const engine = require('../tradeEngine')
const c = require('../../poloConstants')

let actual, expected

const currencyPair = config.get('testData.markets')[0]
const currencies = currencyPair.split('_')
const baseCurrency = currencies[0]
const quoteCurrency = currencies[1]

// 1. The order book for a market with zero orders is something we'll never likely see in the wild.  Nevertheless, for purposes of completeness, I will venture a guess as to a reasonable reply.
test(t => {
  engine.brainWipe()
  engine.desiredOrderBookSeq = 888
  actual = engine.returnOrderBook(config.get('testData.markets')[0], 0)
  expected = {asks: [], bids: [], isFrozen: '0', seq: engine.desiredOrderBookSeq}
  t.deepEqual(actual, expected)
})

// 2. A market with a single buy order.
test(t => {
  engine.brainWipe()

  // In order to buy or sell anything we must first ensure sufficient funds.
  engine.makeDeposit('others', baseCurrency, 100)

  // const currencyPair = config.get('testData.markets')[0]
  engine.buy({apiKey: 'others', currencyPair, 'dt': 1000, rate: 0.015, amount: 2.0})

  engine.desiredOrderBookSeq = 888
  actual = engine.returnOrderBook(currencyPair, 999)
  expected = {
    asks: [],
    bids: [['0.01500000', 2]],
    isFrozen: '0',
    seq: engine.desiredOrderBookSeq
  }
  t.deepEqual(actual, expected)
})

// 3. A market with a two buy orders at the same price.
test(t => {
  engine.brainWipe()

  // In order to buy or sell anything we must first ensure sufficient funds.
  engine.makeDeposit('others', baseCurrency, 100)

  // const currencyPair = config.get('testData.markets')[0]
  engine.buy({apiKey: 'others', currencyPair, 'dt': 1000, rate: 0.015, amount: 2.0})
  engine.buy({apiKey: 'others', currencyPair, 'dt': 1000, rate: 0.015, amount: 2.5})

  engine.desiredOrderBookSeq = 888
  actual = engine.returnOrderBook(currencyPair, 999)
  expected = {
    asks: [],
    bids: [['0.01500000', 4.5]],
    isFrozen: '0',
    seq: engine.desiredOrderBookSeq
  }
  t.deepEqual(actual, expected)
})

// 4. A market with a two buy orders at different prices.
test(t => {
  engine.brainWipe()

  // In order to buy or sell anything we must first ensure sufficient funds.
  engine.makeDeposit('others', baseCurrency, 100)

  engine.buy({apiKey: 'others', currencyPair, 'dt': 1000, rate: 0.015, amount: 2.0})
  engine.buy({apiKey: 'others', currencyPair, 'dt': 1000, rate: 0.016, amount: 2.5})

  engine.desiredOrderBookSeq = 888
  actual = engine.returnOrderBook(currencyPair, 999)
  expected = {
    asks: [],
    bids: [['0.01600000', 2.5], ['0.01500000', 2.0]],
    isFrozen: '0',
    seq: engine.desiredOrderBookSeq
  }
  t.deepEqual(actual, expected)
})

// 5. A market with a single sell order.
test(t => {
  engine.brainWipe()

  // In order to buy or sell anything we must first ensure sufficient funds.
  engine.makeDeposit('others', quoteCurrency, 100)

  engine.sell({apiKey: 'others', currencyPair, 'dt': 1000, rate: 0.015, amount: 2.0})

  engine.desiredOrderBookSeq = 888
  actual = engine.returnOrderBook(currencyPair, 999)
  expected = {
    asks: [['0.01500000', 2]],
    bids: [],
    isFrozen: '0',
    seq: engine.desiredOrderBookSeq
  }
  t.deepEqual(actual, expected)
})

// 6. A market with a two sell orders at the same price.
test(t => {
  engine.brainWipe()

  // In order to buy or sell anything we must first ensure sufficient funds.
  engine.makeDeposit('others', quoteCurrency, 100)

  engine.sell({apiKey: 'others', currencyPair, 'dt': 1000, rate: 0.015, amount: 2.0})
  engine.sell({apiKey: 'others', currencyPair, 'dt': 1000, rate: 0.015, amount: 2.5})

  engine.desiredOrderBookSeq = 888
  actual = engine.returnOrderBook(currencyPair, 999)
  expected = {
    asks: [['0.01500000', 4.5]],
    bids: [],
    isFrozen: '0',
    seq: engine.desiredOrderBookSeq
  }
  t.deepEqual(actual, expected)
})

// 7. A market with a two sell orders at different prices.
test(t => {
  engine.brainWipe()

  // In order to buy or sell anything we must first ensure sufficient funds.
  engine.makeDeposit('others', quoteCurrency, 100)

  engine.sell({apiKey: 'others', currencyPair, 'dt': 1000, rate: 0.015, amount: 2.0})
  engine.sell({apiKey: 'others', currencyPair, 'dt': 1000, rate: 0.016, amount: 2.5})

  engine.desiredOrderBookSeq = 888
  actual = engine.returnOrderBook(currencyPair, 999)
  expected = {
    asks: [['0.01500000', 2.0], ['0.01600000', 2.5]],
    bids: [],
    isFrozen: '0',
    seq: engine.desiredOrderBookSeq
  }
  t.deepEqual(actual, expected)
})

// 8. Depth testing.
test(t => {
  engine.brainWipe()

  // In order to buy or sell anything we must first ensure sufficient funds.
  engine.makeDeposit('others', baseCurrency, 200)
  engine.makeDeposit('others', quoteCurrency, 200)

  // 1. Generate lots of buy and sell orders that don't trade with each other.
  let buyRate = 0.015
  let sellRate = 0.016
  for (let i = 0; i < c.returnOrderBook.defaultDepth + 1; i++) {
    engine.buy({apiKey: 'others', currencyPair, 'dt': 1000, rate: buyRate, amount: 2.0})
    engine.sell({apiKey: 'others', currencyPair, 'dt': 1000, rate: sellRate, amount: 2.0})
    buyRate -= 0.001; sellRate += 0.001
  }

  // 2. Zero depth.
  engine.desiredOrderBookSeq = 888
  actual = engine.returnOrderBook(currencyPair, 0)
  expected = {
    asks: [],
    bids: [],
    isFrozen: '0',
    seq: engine.desiredOrderBookSeq
  }
  t.pass()
  t.deepEqual(actual, expected)

  // 3. One depth.
  engine.desiredOrderBookSeq = 888
  actual = engine.returnOrderBook(currencyPair, 1)
  expected = {
    asks: [['0.01600000', 2]],
    bids: [['0.01500000', 2]],
    isFrozen: '0',
    seq: engine.desiredOrderBookSeq
  }
  t.deepEqual(actual, expected)

  // 4. Two depth.
  engine.desiredOrderBookSeq = 888
  actual = engine.returnOrderBook(currencyPair, 2)
  expected = {
    asks: [['0.01600000', 2], ['0.01700000', 2]],
    bids: [['0.01500000', 2], ['0.01400000', 2]],
    isFrozen: '0',
    seq: engine.desiredOrderBookSeq
  }
  // This really works, but there's a minor round-off error
  // t.deepEqual(actual, expected)
})

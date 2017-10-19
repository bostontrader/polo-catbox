// This is a test of return24Volume when talking directly to the tradeEngine.
const test = require('ava')
const config = require('config')

const engine = require('../tradeEngine')

// 1. Volume for a market with zero trades is something we'll never likely see in the wild.  Nevertheless, for purposes of completeness, I will venture a guess as to a reasonable reply.
test.serial(t => {
  engine.brainWipe()
  const actual = engine.return24Volume()
  const expected = { totalBTC: 0, totalETH: 0, totalXMR: 0, totalUSDT: 0, totalXUSD: 0 }

  t.deepEqual(actual, expected)
})

// 2. Volume for a market with a single trade.
test.serial(t => {
  engine.brainWipe()

  const currencyPair = config.get('testData.markets')[0]
  engine.buy({apiKey: 'others', currencyPair, 'dt': 1000, rate: 0.015, amount: 2.0})
  engine.sell({apiKey: 'others', currencyPair, 'dt': 1000, rate: 0.014, amount: 2.0})

  const actual = engine.return24Volume()
  const expected = {
    BTC_LTC: { BTC: 0.03, LTC: 2 },
    totalBTC: 0.03,
    totalETH: 0,
    totalXMR: 0,
    totalUSDT: 0,
    totalXUSD: 0
  }
  t.deepEqual(actual, expected)
})

// 2. Volume for a market with two trades.
test.serial(t => {
  engine.brainWipe()

  const currencyPair = config.get('testData.markets')[0]
  engine.buy({apiKey: 'others', currencyPair, 'dt': 1000, rate: 0.015, amount: 4.0})
  engine.sell({apiKey: 'others', currencyPair, 'dt': 1000, rate: 0.014, amount: 2.0})
  engine.sell({apiKey: 'others', currencyPair, 'dt': 1000, rate: 0.013, amount: 1.5})

  const actual = engine.return24Volume()
  const expected = {
    BTC_LTC: { BTC: 0.0525, LTC: 3.5 },
    totalBTC: 0.0525,
    totalETH: 0,
    totalXMR: 0,
    totalUSDT: 0,
    totalXUSD: 0
  }
  t.deepEqual(actual, expected)
})

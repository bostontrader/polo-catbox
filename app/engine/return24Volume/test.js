// This is a test of return24Volume when talking directly to the tradeEngine.
const test = require('ava')
const config = require('config')

const engine = require('../tradeEngine')

// 1. Volume for a market with zero trades is something we'll never likely see in the wild.  Nevertheless, for purposes of completeness, I will venture a guess as to a reasonable reply.
test(t => {
  engine.brainWipe()
  const actual = engine.return24Volume()
  const expected = { totalBTC: 0, totalETH: 0, totalXMR: 0, totalUSDT: 0, totalXUSD: 0 }

  t.deepEqual(actual, expected)
})

// 2. Volume for a market with trades.
test(t => {
  let actual, expected
  const currencyPair = config.get('testData.markets')[0]
  const currencies = currencyPair.split('_')
  const baseCurrency = currencies[0]
  const quoteCurrency = currencies[1]

  engine.brainWipe()

  // 1. In order to buy or sell anything we must first ensure sufficient funds.
  engine.makeDeposit('others', baseCurrency, 100)
  engine.makeDeposit('others', quoteCurrency, 100)

  // 2. Setup a single trade
  engine.buy({apiKey: 'others', currencyPair, 'dt': 1000, rate: 0.015, amount: 4.0})
  engine.sell({apiKey: 'others', currencyPair, 'dt': 1000, rate: 0.014, amount: 2.0})

  actual = engine.return24Volume()
  expected = {
    BTC_LTC: { BTC: 0.03, LTC: 2 },
    totalBTC: 0.03,
    totalETH: 0,
    totalXMR: 0,
    totalUSDT: 0,
    totalXUSD: 0
  }
  t.deepEqual(actual, expected)

  // 3. Setup a 2nd trade
  engine.sell({apiKey: 'others', currencyPair, 'dt': 1000, rate: 0.013, amount: 1.5})

  actual = engine.return24Volume()
  expected = {
    BTC_LTC: { BTC: 0.0525, LTC: 3.5 },
    totalBTC: 0.0525,
    totalETH: 0,
    totalXMR: 0,
    totalUSDT: 0,
    totalXUSD: 0
  }
  t.deepEqual(actual, expected)
})

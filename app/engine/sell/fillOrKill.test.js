/*
This is a test of fillOrKill sell orders when talking directly to the tradeEngine.

Recall that fillOrKill means to fill the order in its entirety or nothing at all.
*/
const test = require('ava')

const engine = require('../tradeEngine')
const poloConstants = require('../../poloConstants')

// The buy orders that we use for testing will be injected into the engine state in a particular order designed to trip over edge cases.  However, this order makes it extremely tedious to observe changes to the orders as this test proceeds.  This function will enable us to easily sort the buy orders, purely as a convenience.
const sortCurPairAscRateDescDatetimeAsc = function (a, b) {
  if (a.currencyPair < b.currencyPair) return -1
  if (a.currencyPair > b.currencyPair) return 1

  if (a.rate > b.rate) return -1
  if (a.rate < b.rate) return 1

  // a.rate must be equal to b.rate. Now sort by dt
  if (a.dt < b.dt) return -1
  if (a.dt > b.dt) return 1

  // a.dt must be equal to b.dt.
  return 0
}

test.serial(t => {
  const baseCurrency = 'BTC'
  const quoteCurrency = 'LTC'
  const currencyPair = baseCurrency + '_' + quoteCurrency
  const date = '2017-10-07 11:55:18'

  // Start by injecting this carefully crafted collection of buy orders to start with.  The actual sequence of injection should not matter because the engine will filter and sort, but this order is important in order to trigger edge cases of the test.
  // The BTC_ETH is added to muddy the water and should be excluded by the engine.
  engine.buy({apiKey: 'others', currencyPair: 'BTC_ETH', 'dt': 1008, rate: 0.015, amount: 1.0})
  engine.buy({apiKey: 'others', currencyPair, 'dt': 1003, rate: 0.020, amount: 1.0})
  engine.buy({apiKey: 'others', currencyPair, 'dt': 1003, rate: 0.022, amount: 1.0})
  engine.buy({apiKey: 'others', currencyPair, 'dt': 1003, rate: 0.022, amount: 1.0})
  engine.buy({apiKey: 'others', currencyPair, 'dt': 1009, rate: 0.020, amount: 1.0})
  engine.buy({apiKey: 'others', currencyPair, 'dt': 1002, rate: 0.022, amount: 1.0})
  engine.buy({apiKey: 'others', currencyPair, 'dt': 1000, rate: 0.022, amount: 1.0})
  engine.buy({apiKey: 'others', currencyPair, 'dt': 1001, rate: 0.022, amount: 1.0})

  let actual
  let expected

  // 1. Attempt to sell at a price higher than dt 1000's bid price.  Should be no sale.
  actual = engine.sell({apiKey: 'me', currencyPair, 'dt': 2000, rate: 0.023, amount: 1.0, fillOrKill: 1})
  expected = {error: poloConstants.UNABLE_TO_FILL_ORDER_COMPLETELY}
  t.deepEqual(actual, expected)

  // 1.1 Verify trades
  t.deepEqual(engine.trades, [])

  // 1.2 Verify orders to sell
  t.deepEqual(engine.orders2Sell, [])

  // 1.3 Verify orders to buy
  actual = engine.orders2Buy.sort(sortCurPairAscRateDescDatetimeAsc)
  expected = [
    {apiKey: 'others', currencyPair: 'BTC_ETH', 'dt': 1008, rate: 0.015, amount: 1.0},
    {apiKey: 'others', currencyPair, 'dt': 1000, rate: 0.022, amount: 1.0},
    {apiKey: 'others', currencyPair, 'dt': 1001, rate: 0.022, amount: 1.0},
    {apiKey: 'others', currencyPair, 'dt': 1002, rate: 0.022, amount: 1.0},
    {apiKey: 'others', currencyPair, 'dt': 1003, rate: 0.022, amount: 1.0},
    {apiKey: 'others', currencyPair, 'dt': 1003, rate: 0.022, amount: 1.0},
    {apiKey: 'others', currencyPair, 'dt': 1003, rate: 0.020, amount: 1.0},
    {apiKey: 'others', currencyPair, 'dt': 1009, rate: 0.020, amount: 1.0}
  ]
  t.deepEqual(actual, expected)

  // 2. sell consumes all of dt 1000 and 3/4 of dt 1001. Two buy orders at the same price, earliest order first.
  actual = engine.sell({apiKey: 'me', currencyPair, 'dt': 2000, rate: 0.019, amount: 1.75, fillOrKill: 1})
  expected = {
    'orderNumber': '1',
    'resultingTrades': [
      {amount: 1, date, rate: 0.022, total: 0.022, tradeID: '1', type: 'sell', baseCurrency, quoteCurrency},
      {amount: 0.75, date, rate: 0.022, total: 0.0165, tradeID: '1', type: 'sell', baseCurrency, quoteCurrency}
    ]
  }
  t.deepEqual(actual, expected)

  // 2.1 Verify trades
  actual = engine.trades
  expected = [
    {amount: 1, date, rate: 0.022, total: 0.022, tradeID: '1', type: 'sell', baseCurrency, quoteCurrency},
    {amount: 0.75, date, rate: 0.022, total: 0.0165, tradeID: '1', type: 'sell', baseCurrency, quoteCurrency}
  ]
  t.deepEqual(actual, expected)

  // 2.2 Verify orders to sell
  t.deepEqual(engine.orders2Sell, [])

  // 2.3 Verify orders to buy
  actual = engine.orders2Buy.sort(sortCurPairAscRateDescDatetimeAsc)
  expected = [
    {apiKey: 'others', currencyPair: 'BTC_ETH', 'dt': 1008, rate: 0.015, amount: 1.0},
    {apiKey: 'others', currencyPair, 'dt': 1000, rate: 0.022, amount: 0},
    {apiKey: 'others', currencyPair, 'dt': 1001, rate: 0.022, amount: 0.25},
    {apiKey: 'others', currencyPair, 'dt': 1002, rate: 0.022, amount: 1.0},
    {apiKey: 'others', currencyPair, 'dt': 1003, rate: 0.022, amount: 1.0},
    {apiKey: 'others', currencyPair, 'dt': 1003, rate: 0.022, amount: 1.0},
    {apiKey: 'others', currencyPair, 'dt': 1003, rate: 0.020, amount: 1.0},
    {apiKey: 'others', currencyPair, 'dt': 1009, rate: 0.020, amount: 1.0}
  ]
  t.deepEqual(actual, expected)

  // 3. sell consumes 1/4 of dt 1001 (the remainder) and 3/4 of dt 1002.
  actual = engine.sell({apiKey: 'me', currencyPair, 'dt': 2000, rate: 0.019, amount: 1, fillOrKill: 1})
  expected = {
    'orderNumber': '1',
    'resultingTrades': [
      {amount: 0.25, date, rate: 0.022, total: 0.0055, tradeID: '1', type: 'sell', baseCurrency, quoteCurrency},
      {amount: 0.75, date, rate: 0.022, total: 0.0165, tradeID: '1', type: 'sell', baseCurrency, quoteCurrency}
    ]
  }
  t.deepEqual(actual, expected)

  // 3.1 Verify trades
  actual = engine.trades
  expected = [
    {amount: 1, date, rate: 0.022, total: 0.022, tradeID: '1', type: 'sell', baseCurrency, quoteCurrency},
    {amount: 0.75, date, rate: 0.022, total: 0.0165, tradeID: '1', type: 'sell', baseCurrency, quoteCurrency},
    {amount: 0.25, date, rate: 0.022, total: 0.0055, tradeID: '1', type: 'sell', baseCurrency, quoteCurrency},
    {amount: 0.75, date, rate: 0.022, total: 0.0165, tradeID: '1', type: 'sell', baseCurrency, quoteCurrency}
  ]
  t.deepEqual(actual, expected)

  // 3.2 Verify orders to sell
  t.deepEqual(engine.orders2Sell, [])

  // 3.3 Verify orders to buy
  actual = engine.orders2Buy.sort(sortCurPairAscRateDescDatetimeAsc)
  expected = [
    {apiKey: 'others', currencyPair: 'BTC_ETH', 'dt': 1008, rate: 0.015, amount: 1.0},
    {apiKey: 'others', currencyPair, 'dt': 1000, rate: 0.022, amount: 0},
    {apiKey: 'others', currencyPair, 'dt': 1001, rate: 0.022, amount: 0},
    {apiKey: 'others', currencyPair, 'dt': 1002, rate: 0.022, amount: 0.25},
    {apiKey: 'others', currencyPair, 'dt': 1003, rate: 0.022, amount: 1.0},
    {apiKey: 'others', currencyPair, 'dt': 1003, rate: 0.022, amount: 1.0},
    {apiKey: 'others', currencyPair, 'dt': 1003, rate: 0.020, amount: 1.0},
    {apiKey: 'others', currencyPair, 'dt': 1009, rate: 0.020, amount: 1.0}
  ]
  t.deepEqual(actual, expected)

  // 4. consume all open orders >= 0.22 and 1/2 of 1003,0.020
  actual = engine.sell({apiKey: 'me', currencyPair, 'dt': 2000, rate: 0.020, amount: 2.75, fillOrKill: 1})
  expected = {
    'orderNumber': '1',
    'resultingTrades': [
      {amount: 0.25, date, rate: 0.022, total: 0.0055, tradeID: '1', type: 'sell', baseCurrency, quoteCurrency},
      {amount: 1, date, rate: 0.022, total: 0.022, tradeID: '1', type: 'sell', baseCurrency, quoteCurrency},
      {amount: 1, date, rate: 0.022, total: 0.022, tradeID: '1', type: 'sell', baseCurrency, quoteCurrency},
      {amount: 0.5, date, rate: 0.020, total: 0.01, tradeID: '1', type: 'sell', baseCurrency, quoteCurrency}
    ]
  }
  t.deepEqual(actual, expected)

  // 4.1 Verify trades
  actual = engine.trades
  expected = [
    {amount: 1, date, rate: 0.022, total: 0.022, tradeID: '1', type: 'sell', baseCurrency, quoteCurrency},
    {amount: 0.75, date, rate: 0.022, total: 0.0165, tradeID: '1', type: 'sell', baseCurrency, quoteCurrency},
    {amount: 0.25, date, rate: 0.022, total: 0.0055, tradeID: '1', type: 'sell', baseCurrency, quoteCurrency},
    {amount: 0.75, date, rate: 0.022, total: 0.0165, tradeID: '1', type: 'sell', baseCurrency, quoteCurrency},
    {amount: 0.25, date, rate: 0.022, total: 0.0055, tradeID: '1', type: 'sell', baseCurrency, quoteCurrency},
    {amount: 1, date, rate: 0.022, total: 0.022, tradeID: '1', type: 'sell', baseCurrency, quoteCurrency},
    {amount: 1, date, rate: 0.022, total: 0.022, tradeID: '1', type: 'sell', baseCurrency, quoteCurrency},
    {amount: 0.5, date, rate: 0.020, total: 0.01, tradeID: '1', type: 'sell', baseCurrency, quoteCurrency}
  ]
  t.deepEqual(actual, expected)

  // 4.2 Verify orders to sell
  t.deepEqual(engine.orders2Sell, [])

  // 4.3 Verify orders to buy
  actual = engine.orders2Buy.sort(sortCurPairAscRateDescDatetimeAsc)
  expected = [
    {apiKey: 'others', currencyPair: 'BTC_ETH', 'dt': 1008, rate: 0.015, amount: 1.0},
    {apiKey: 'others', currencyPair, 'dt': 1000, rate: 0.022, amount: 0},
    {apiKey: 'others', currencyPair, 'dt': 1001, rate: 0.022, amount: 0},
    {apiKey: 'others', currencyPair, 'dt': 1002, rate: 0.022, amount: 0},
    {apiKey: 'others', currencyPair, 'dt': 1003, rate: 0.022, amount: 0},
    {apiKey: 'others', currencyPair, 'dt': 1003, rate: 0.022, amount: 0},
    {apiKey: 'others', currencyPair, 'dt': 1003, rate: 0.020, amount: 0.5},
    {apiKey: 'others', currencyPair, 'dt': 1009, rate: 0.020, amount: 1.0}
  ]
  t.deepEqual(actual, expected)

  // 5. sell tries to consume more than is available at 0.19 and gets nothing.
  actual = engine.sell({apiKey: 'me', currencyPair, 'dt': 2000, rate: 0.019, amount: 3, fillOrKill: 1})
  expected = {error: poloConstants.UNABLE_TO_FILL_ORDER_COMPLETELY}
  t.deepEqual(actual, expected)

  // 5.1 Verify trades
  actual = engine.trades
  expected = [
    {amount: 1, date, rate: 0.022, total: 0.022, tradeID: '1', type: 'sell', baseCurrency, quoteCurrency},
    {amount: 0.75, date, rate: 0.022, total: 0.0165, tradeID: '1', type: 'sell', baseCurrency, quoteCurrency},
    {amount: 0.25, date, rate: 0.022, total: 0.0055, tradeID: '1', type: 'sell', baseCurrency, quoteCurrency},
    {amount: 0.75, date, rate: 0.022, total: 0.0165, tradeID: '1', type: 'sell', baseCurrency, quoteCurrency},
    {amount: 0.25, date, rate: 0.022, total: 0.0055, tradeID: '1', type: 'sell', baseCurrency, quoteCurrency},
    {amount: 1, date, rate: 0.022, total: 0.022, tradeID: '1', type: 'sell', baseCurrency, quoteCurrency},
    {amount: 1, date, rate: 0.022, total: 0.022, tradeID: '1', type: 'sell', baseCurrency, quoteCurrency},
    {amount: 0.5, date, rate: 0.020, total: 0.01, tradeID: '1', type: 'sell', baseCurrency, quoteCurrency}
  ]
  t.deepEqual(actual, expected)

  // 5.2 Verify orders to sell
  t.deepEqual(engine.orders2Sell, [])

  // 5.3 Verify orders to buy
  actual = engine.orders2Buy.sort(sortCurPairAscRateDescDatetimeAsc)
  expected = [
    {apiKey: 'others', currencyPair: 'BTC_ETH', 'dt': 1008, rate: 0.015, amount: 1.0},
    {apiKey: 'others', currencyPair, 'dt': 1000, rate: 0.022, amount: 0},
    {apiKey: 'others', currencyPair, 'dt': 1001, rate: 0.022, amount: 0},
    {apiKey: 'others', currencyPair, 'dt': 1002, rate: 0.022, amount: 0},
    {apiKey: 'others', currencyPair, 'dt': 1003, rate: 0.022, amount: 0},
    {apiKey: 'others', currencyPair, 'dt': 1003, rate: 0.022, amount: 0},
    {apiKey: 'others', currencyPair, 'dt': 1003, rate: 0.020, amount: 0.5},
    {apiKey: 'others', currencyPair, 'dt': 1009, rate: 0.020, amount: 1.0}
  ]
  t.deepEqual(actual, expected)

  // 6. sell exactly the remaining quantity of 1003, 0.20.
  actual = engine.sell({apiKey: 'me', currencyPair, 'dt': 2000, rate: 0.020, amount: 0.5, fillOrKill: 1})
  expected = {
    orderNumber: '1',
    resultingTrades: [
      {amount: 0.5, date, rate: 0.020, total: 0.01, tradeID: '1', type: 'sell', baseCurrency, quoteCurrency}
    ]
  }
  t.deepEqual(actual, expected)

  // 6.1 Verify trades
  actual = engine.trades
  expected = [
    {amount: 1, date, rate: 0.022, total: 0.022, tradeID: '1', type: 'sell', baseCurrency, quoteCurrency},
    {amount: 0.75, date, rate: 0.022, total: 0.0165, tradeID: '1', type: 'sell', baseCurrency, quoteCurrency},
    {amount: 0.25, date, rate: 0.022, total: 0.0055, tradeID: '1', type: 'sell', baseCurrency, quoteCurrency},
    {amount: 0.75, date, rate: 0.022, total: 0.0165, tradeID: '1', type: 'sell', baseCurrency, quoteCurrency},
    {amount: 0.25, date, rate: 0.022, total: 0.0055, tradeID: '1', type: 'sell', baseCurrency, quoteCurrency},
    {amount: 1, date, rate: 0.022, total: 0.022, tradeID: '1', type: 'sell', baseCurrency, quoteCurrency},
    {amount: 1, date, rate: 0.022, total: 0.022, tradeID: '1', type: 'sell', baseCurrency, quoteCurrency},
    {amount: 0.5, date, rate: 0.020, total: 0.01, tradeID: '1', type: 'sell', baseCurrency, quoteCurrency},
    {amount: 0.5, date, rate: 0.020, total: 0.01, tradeID: '1', type: 'sell', baseCurrency, quoteCurrency}
  ]
  t.deepEqual(actual, expected)

  // 6.2 Verify orders to sell
  t.deepEqual(engine.orders2Sell, [])

  // 6.3 Verify orders to buy
  actual = engine.orders2Buy.sort(sortCurPairAscRateDescDatetimeAsc)
  expected = [
    {apiKey: 'others', currencyPair: 'BTC_ETH', 'dt': 1008, rate: 0.015, amount: 1.0},
    {apiKey: 'others', currencyPair, 'dt': 1000, rate: 0.022, amount: 0},
    {apiKey: 'others', currencyPair, 'dt': 1001, rate: 0.022, amount: 0},
    {apiKey: 'others', currencyPair, 'dt': 1002, rate: 0.022, amount: 0},
    {apiKey: 'others', currencyPair, 'dt': 1003, rate: 0.022, amount: 0},
    {apiKey: 'others', currencyPair, 'dt': 1003, rate: 0.022, amount: 0},
    {apiKey: 'others', currencyPair, 'dt': 1003, rate: 0.020, amount: 0},
    {apiKey: 'others', currencyPair, 'dt': 1009, rate: 0.020, amount: 1.0}
  ]
  t.deepEqual(actual, expected)
})

/*
This is a test of ordinary sell orders when talking directly to the tradeEngine.

Recall that 'ordinary' means no fillOrKill, immediateOrCancl, or postOnly.  In this case the order should be treated just like immediateOrCancel _except_ that any unfulfilled portion of the order is left on the books as a residual sell order.
*/
const test = require('ava')

const engine = require('../tradeEngine')

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
  // Start by injecting this carefully crafted collection of buy orders to start with.  The actual sequence of injection should not matter because the engine will filter and sort, but this order is important in order to trigger edge cases of the test.
  // The BTC_ETH is added to muddy the water and should be excluded by the engine.
  engine.buy({apiKey: 'others', currencyPair: 'BTC_ETH', 'dt': 1008, rate: 0.015, amount: 1.0})
  engine.buy({apiKey: 'others', currencyPair: 'BTC_LTC', 'dt': 1003, rate: 0.020, amount: 1.0})
  engine.buy({apiKey: 'others', currencyPair: 'BTC_LTC', 'dt': 1003, rate: 0.022, amount: 1.0})
  engine.buy({apiKey: 'others', currencyPair: 'BTC_LTC', 'dt': 1003, rate: 0.022, amount: 1.0})
  engine.buy({apiKey: 'others', currencyPair: 'BTC_LTC', 'dt': 1009, rate: 0.020, amount: 1.0})
  engine.buy({apiKey: 'others', currencyPair: 'BTC_LTC', 'dt': 1002, rate: 0.022, amount: 1.0})
  engine.buy({apiKey: 'others', currencyPair: 'BTC_LTC', 'dt': 1000, rate: 0.022, amount: 1.0})
  engine.buy({apiKey: 'others', currencyPair: 'BTC_LTC', 'dt': 1001, rate: 0.022, amount: 1.0})

  let actual
  let expected

  // 1. Attempt to sell at a price higher than dt 1000's bid price.  Should be no sale and a new sell order should be posted.
  actual = engine.sell({apiKey: 'me', currencyPair: 'BTC_LTC', 'dt': 2000, rate: 0.023, amount: 1.0})
  expected = {orderNumber: '1', resultingTrades: []}
  t.deepEqual(actual, expected)

  // 1.1 Verify trades
  t.deepEqual(engine.trades, [])

  // 1.2 Verify orders to sell
  actual = engine.orders2Sell
  expected = [{apiKey: 'me', currencyPair: 'BTC_LTC', 'dt': 2000, rate: 0.023, amount: 1.0}]
  t.deepEqual(actual, expected)

  // 1.3 Verify orders to buy
  actual = engine.orders2Buy.sort(sortCurPairAscRateDescDatetimeAsc)
  expected = [
    {apiKey: 'others', currencyPair: 'BTC_ETH', 'dt': 1008, rate: 0.015, amount: 1.0},
    {apiKey: 'others', currencyPair: 'BTC_LTC', 'dt': 1000, rate: 0.022, amount: 1.0},
    {apiKey: 'others', currencyPair: 'BTC_LTC', 'dt': 1001, rate: 0.022, amount: 1.0},
    {apiKey: 'others', currencyPair: 'BTC_LTC', 'dt': 1002, rate: 0.022, amount: 1.0},
    {apiKey: 'others', currencyPair: 'BTC_LTC', 'dt': 1003, rate: 0.022, amount: 1.0},
    {apiKey: 'others', currencyPair: 'BTC_LTC', 'dt': 1003, rate: 0.022, amount: 1.0},
    {apiKey: 'others', currencyPair: 'BTC_LTC', 'dt': 1003, rate: 0.020, amount: 1.0},
    {apiKey: 'others', currencyPair: 'BTC_LTC', 'dt': 1009, rate: 0.020, amount: 1.0}
  ]
  t.deepEqual(actual, expected)

  // 2. sell consumes all of dt 1000 and 3/4 of dt 1001. Two buy orders at the same price, earliest order first.
  // This order is completely fulfilled so there is no residual buy order.
  actual = engine.sell({apiKey: 'me', currencyPair: 'BTC_LTC', 'dt': 2000, rate: 0.019, amount: 1.75})
  expected = {
    orderNumber: '1',
    resultingTrades: [
      {amount: 1, date: '2017-10-07 11:55:18', rate: 0.022, total: 0.022, tradeID: '1', type: 'sell'},
      {amount: 0.75, date: '2017-10-07 11:55:18', rate: 0.022, total: 0.0165, tradeID: '1', type: 'sell'}
    ]
  }
  t.deepEqual(actual, expected)

  // 2.1 Verify trades
  actual = engine.trades
  expected = [
    {amount: 1, date: '2017-10-07 11:55:18', rate: 0.022, total: 0.022, tradeID: '1', type: 'sell'},
    {amount: 0.75, date: '2017-10-07 11:55:18', rate: 0.022, total: 0.0165, tradeID: '1', type: 'sell'}
  ]
  t.deepEqual(actual, expected)

  // 2.2 Verify orders to sell
  actual = engine.orders2Sell
  expected = [{apiKey: 'me', currencyPair: 'BTC_LTC', 'dt': 2000, rate: 0.023, amount: 1.0}]
  t.deepEqual(actual, expected)

  // 2.3 Verify orders to buy
  actual = engine.orders2Buy.sort(sortCurPairAscRateDescDatetimeAsc)
  expected = [
    {apiKey: 'others', currencyPair: 'BTC_ETH', dt: 1008, rate: 0.015, amount: 1},
    {apiKey: 'others', currencyPair: 'BTC_LTC', dt: 1000, rate: 0.022, amount: 0},
    {apiKey: 'others', currencyPair: 'BTC_LTC', dt: 1001, rate: 0.022, amount: 0.25},
    {apiKey: 'others', currencyPair: 'BTC_LTC', dt: 1002, rate: 0.022, amount: 1},
    {apiKey: 'others', currencyPair: 'BTC_LTC', dt: 1003, rate: 0.022, amount: 1},
    {apiKey: 'others', currencyPair: 'BTC_LTC', dt: 1003, rate: 0.022, amount: 1},
    {apiKey: 'others', currencyPair: 'BTC_LTC', dt: 1003, rate: 0.02, amount: 1},
    {apiKey: 'others', currencyPair: 'BTC_LTC', dt: 1009, rate: 0.02, amount: 1}
  ]
  t.deepEqual(actual, expected)

  // 3. sell tries to consume more than is available at 0.022.  This will result in a residual sell order.
  actual = engine.sell({apiKey: 'me', currencyPair: 'BTC_LTC', 'dt': 2000, rate: 0.022, amount: 4})
  expected = {
    orderNumber: '1',
    resultingTrades: [
      {amount: 0.25, date: '2017-10-07 11:55:18', rate: 0.022, total: 0.0055, tradeID: '1', type: 'sell'},
      {amount: 1, date: '2017-10-07 11:55:18', rate: 0.022, total: 0.022, tradeID: '1', type: 'sell'},
      {amount: 1, date: '2017-10-07 11:55:18', rate: 0.022, total: 0.022, tradeID: '1', type: 'sell'},
      {amount: 1, date: '2017-10-07 11:55:18', rate: 0.022, total: 0.022, tradeID: '1', type: 'sell'}
    ]
  }
  t.deepEqual(actual, expected)

  // 3.1 Verify trades
  actual = engine.trades
  expected = [
    {amount: 1, date: '2017-10-07 11:55:18', rate: 0.022, total: 0.022, tradeID: '1', type: 'sell'},
    {amount: 0.75, date: '2017-10-07 11:55:18', rate: 0.022, total: 0.0165, tradeID: '1', type: 'sell'},
    {amount: 0.25, date: '2017-10-07 11:55:18', rate: 0.022, total: 0.0055, tradeID: '1', type: 'sell'},
    {amount: 1, date: '2017-10-07 11:55:18', rate: 0.022, total: 0.022, tradeID: '1', type: 'sell'},
    {amount: 1, date: '2017-10-07 11:55:18', rate: 0.022, total: 0.022, tradeID: '1', type: 'sell'},
    {amount: 1, date: '2017-10-07 11:55:18', rate: 0.022, total: 0.022, tradeID: '1', type: 'sell'}
  ]
  t.deepEqual(actual, expected)

  // 3.2 Verify orders to sell
  actual = engine.orders2Sell
  expected = [
    {apiKey: 'me', currencyPair: 'BTC_LTC', dt: 2000, rate: 0.023, amount: 1},
    {apiKey: 'me', currencyPair: 'BTC_LTC', dt: 2000, rate: 0.022, amount: 0.75}
  ]
  t.deepEqual(actual, expected)

  // 3.3 Verify orders to buy
  actual = engine.orders2Buy.sort(sortCurPairAscRateDescDatetimeAsc)
  expected = [
    {apiKey: 'others', currencyPair: 'BTC_ETH', dt: 1008, rate: 0.015, amount: 1},
    {apiKey: 'others', currencyPair: 'BTC_LTC', dt: 1000, rate: 0.022, amount: 0},
    {apiKey: 'others', currencyPair: 'BTC_LTC', dt: 1001, rate: 0.022, amount: 0},
    {apiKey: 'others', currencyPair: 'BTC_LTC', dt: 1002, rate: 0.022, amount: 0},
    {apiKey: 'others', currencyPair: 'BTC_LTC', dt: 1003, rate: 0.022, amount: 0},
    {apiKey: 'others', currencyPair: 'BTC_LTC', dt: 1003, rate: 0.022, amount: 0},
    {apiKey: 'others', currencyPair: 'BTC_LTC', dt: 1003, rate: 0.02, amount: 1},
    {apiKey: 'others', currencyPair: 'BTC_LTC', dt: 1009, rate: 0.02, amount: 1}
  ]
  t.deepEqual(actual, expected)
})

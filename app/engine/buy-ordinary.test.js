/*
This is a test of ordinary buy orders when talking directly to the tradeEngine.

Recall that 'ordinary' means no fillOrKill, immediateOrCancl, or postOnly.  In this case the order should be treated just like immediateOrCancel _except_ that any unfulfilled portion of the order is left on the books as a residual buy order.

*/
const test = require('ava')

const engine        = require('./tradeEngine')

// The sell orders that we use for testing will be injected into the engine state in a funny order designed to trip over edge cases.  However, this order makes it extremely tedious to observe changes to the orders as this test proceeds.  This function will enable us to easily sort the sell orders, purely as a convenience.
const sort_CPASC_RateASC_DtASC = function (a, b) {

  if (a.currencyPair < b.currencyPair) return -1
  if (a.currencyPair > b.currencyPair) return 1

  if (a.rate < b.rate) return -1
  if (a.rate > b.rate) return 1

  // a.rate must be equal to b.rate. Now sort by dt
  if (a.dt < b.dt) return -1
  if (a.dt > b.dt) return 1

  // a.dt must be equal to b.dt.
  return 0
}

test.serial(t => {
  // Because the focus of this test is ordinary buy orders, I will start by injecting this carefully crafted collection of sell orders to start with.  The actual sequence of injection should not matter because the engine will filter and sort, but this order is important in order to trigger edge cases of the test.
  // The BTC_ETH is added to muddy the water and should be excluded by the engine.
  engine.sell({apiKey:'others', currencyPair:'BTC_ETH', 'dt': 1008, rate: 0.020, amount: 1.0})
  engine.sell({apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1003, rate: 0.022, amount: 1.0})
  engine.sell({apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1003, rate: 0.020, amount: 1.0})
  engine.sell({apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1009, rate: 0.027, amount: 1.0})
  engine.sell({apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1003, rate: 0.020, amount: 1.0})
  engine.sell({apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1009, rate: 0.022, amount: 1.0})
  engine.sell({apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1002, rate: 0.020, amount: 1.0})
  engine.sell({apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1000, rate: 0.020, amount: 1.0})
  engine.sell({apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1001, rate: 0.020, amount: 1.0})

  let actual
  let expected

  // 1. Attempt to buy a price lower than dt 1000's ask price.  Should be no purchase and the buy order should be posted.
  actual = engine.buy({apiKey:'me', currencyPair:'BTC_LTC', 'dt': 2000, rate: 0.019, amount: 1.0})
  expected = { orderNumber: '1', resultingTrades: []}
  t.deepEqual(actual, expected)

  // The orders to sell should be unchanged
  actual = engine.orders2Sell.sort(sort_CPASC_RateASC_DtASC)
  expected = [
    {apiKey:'others', currencyPair:'BTC_ETH', 'dt': 1008, rate: 0.020, amount: 1.0},
    {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1000, rate: 0.020, amount: 1.0},
    {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1001, rate: 0.020, amount: 1.0},
    {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1002, rate: 0.020, amount: 1.0},
    {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1003, rate: 0.020, amount: 1.0},
    {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1003, rate: 0.020, amount: 1.0},
    {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1003, rate: 0.022, amount: 1.0},
    {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1009, rate: 0.022, amount: 1.0},
    {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1009, rate: 0.027, amount: 1.0}
  ]
  t.deepEqual(actual, expected)

  // The orders to buy should have a new order
  actual = engine.orders2Buy.sort(sort_CPASC_RateASC_DtASC)
  expected = [{apiKey: 'me', currencyPair: 'BTC_LTC', dt: 2000, rate: 0.019, amount: 1}]
  t.deepEqual(actual, expected)

  // 2. buy consumes all of dt 1000 and 3/4 of dt 1001. Two sell orders at the same price, earliest order first.
  // This order is completely fulfilled so there is no residual buy order.
  actual = engine.buy({apiKey:'me', currencyPair:'BTC_LTC', 'dt': 2000, rate: 0.023, amount: 1.75})
  expected = {
    "orderNumber":"1",
    "resultingTrades":[
      {"amount":1,"date":"2017-10-07 11:55:18","rate":0.02,"total":0.02,"tradeID":"1","type":"buy"},
      {"amount":0.75,"date":"2017-10-07 11:55:18","rate":0.02,"total":0.015,"tradeID":"1","type":"buy"}
    ]
  }
  t.deepEqual(actual, expected)

  // globalOpenOrders is correct
  actual = engine.orders2Sell.sort(sort_CPASC_RateASC_DtASC)
  expected = [
    {apiKey:'others', currencyPair:'BTC_ETH', 'dt': 1008, rate: 0.020, amount: 1.0},
    {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1000, rate: 0.020, amount: 0},
    {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1001, rate: 0.020, amount: 0.25},
    {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1002, rate: 0.020, amount: 1.0},
    {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1003, rate: 0.020, amount: 1.0},
    {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1003, rate: 0.020, amount: 1.0},
    {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1003, rate: 0.022, amount: 1.0},
    {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1009, rate: 0.022, amount: 1.0},
    {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1009, rate: 0.027, amount: 1.0}
  ]
  t.deepEqual(actual, expected)

  // The orders to buy should not have a new order
  actual = engine.orders2Buy.sort(sort_CPASC_RateASC_DtASC)
  expected = [{apiKey: 'me', currencyPair: 'BTC_LTC', dt: 2000, rate: 0.019, amount: 1}]
  t.deepEqual(actual, expected)

  // 3. buy tries to consume more than is available at 0.02.  This will result in a residual buy order.
  actual = engine.buy({apiKey:'me', currencyPair:'BTC_LTC', 'dt': 2000, rate: 0.02, amount: 4})
  expected = {
    orderNumber: '1',
    resultingTrades: [
      {amount: 0.25, date: '2017-10-07 11:55:18', rate: 0.02, total: 0.005, tradeID: '1', type: 'buy' },
      {amount: 1, date: '2017-10-07 11:55:18', rate: 0.02, total: 0.02, tradeID: '1', type: 'buy' },
      {amount: 1, date: '2017-10-07 11:55:18', rate: 0.02, total: 0.02, tradeID: '1', type: 'buy' },
      {amount: 1, date: '2017-10-07 11:55:18', rate: 0.02, total: 0.02, tradeID: '1', type: 'buy' }
    ]
  }

  t.deepEqual(actual, expected)

  // globalOpenOrders is correct. no change.
  actual = engine.orders2Sell.sort(sort_CPASC_RateASC_DtASC)

  expected = [
    {apiKey:'others', currencyPair:'BTC_ETH', 'dt': 1008, rate: 0.020, amount: 1.0},
    {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1000, rate: 0.020, amount: 0},
    {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1001, rate: 0.020, amount: 0},
    {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1002, rate: 0.020, amount: 0},
    {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1003, rate: 0.020, amount: 0},
    {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1003, rate: 0.020, amount: 0},
    {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1003, rate: 0.022, amount: 1.0},
    {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1009, rate: 0.022, amount: 1.0},
    {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1009, rate: 0.027, amount: 1.0}
  ]

  t.deepEqual(actual, expected)

  // The orders to buy should have a new order
  actual = engine.orders2Buy.sort(sort_CPASC_RateASC_DtASC)
  expected = [
    {apiKey: 'me', currencyPair: 'BTC_LTC', dt: 2000, rate: 0.019, amount: 1},
    {apiKey: 'me', currencyPair: 'BTC_LTC', dt: 2000, rate: 0.02, amount: 0.75}
  ]

  t.deepEqual(actual, expected)

})

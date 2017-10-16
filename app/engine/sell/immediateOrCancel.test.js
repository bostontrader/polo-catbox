/*
This is a test of immediateOrCancel sell orders when talking directly to the tradeEngine.

Recall that immediateOrCancel means to fill as much as possible of the order immediately, but cancel the remainder of the order..
*/
const test = require('ava')

const engine        = require('../tradeEngine')
const poloConstants = require('../../poloConstants')

// The buy orders that we use for testing will be injected into the engine state in a particular order designed to trip over edge cases.  However, this order makes it extremely tedious to observe changes to the orders as this test proceeds.  This function will enable us to easily sort the buy orders, purely as a convenience.
const sort_CPASC_RateDESC_DtASC = function (a, b) {

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
  engine.buy({apiKey:'others', currencyPair:'BTC_ETH', 'dt': 1008, rate: 0.015, amount: 1.0})
  engine.buy({apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1003, rate: 0.020, amount: 1.0})
  engine.buy({apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1003, rate: 0.022, amount: 1.0})
  engine.buy({apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1003, rate: 0.022, amount: 1.0})
  engine.buy({apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1009, rate: 0.020, amount: 1.0})
  engine.buy({apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1002, rate: 0.022, amount: 1.0})
  engine.buy({apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1000, rate: 0.022, amount: 1.0})
  engine.buy({apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1001, rate: 0.022, amount: 1.0})

  let actual
  let expected

  // 1. Attempt to sell at a price higher than dt 1000's bid price.  Should be no sale.
  actual = engine.sell({apiKey:'me', currencyPair:'BTC_LTC', 'dt': 2000, rate: 0.023, amount: 1.0, immediateOrCancel:1})
  expected = { orderNumber: '1', resultingTrades: [], amountUnfilled: 1 }
  t.deepEqual(actual, expected)

  // The orders to buy should be unchanged
  actual = engine.orders2Buy.sort(sort_CPASC_RateDESC_DtASC)
  expected = [
    {apiKey:'others', currencyPair:'BTC_ETH', 'dt': 1008, rate: 0.015, amount: 1.0},
    {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1000, rate: 0.022, amount: 1.0},
    {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1001, rate: 0.022, amount: 1.0},
    {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1002, rate: 0.022, amount: 1.0},
    {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1003, rate: 0.022, amount: 1.0},
    {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1003, rate: 0.022, amount: 1.0},
    {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1003, rate: 0.020, amount: 1.0},
    {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1009, rate: 0.020, amount: 1.0}
  ]
  t.deepEqual(actual, expected)

  // 2. sell consumes all of dt 1000 and 3/4 of dt 1001. Two buy orders at the same price, earliest order first.
  actual = engine.sell({apiKey:'me', currencyPair:'BTC_LTC', 'dt': 2000, rate: 0.019, amount: 1.75, immediateOrCancel:1})
  expected = {
    "orderNumber":"1",
    "resultingTrades":[
      {"amount":1,"date":"2017-10-07 11:55:18","rate":0.022,"total":0.022,"tradeID":"1","type":"sell"},
      {"amount":0.75,"date":"2017-10-07 11:55:18","rate":0.022,"total":0.0165,"tradeID":"1","type":"sell"}
    ],
    amountUnfilled: 0
  }
  t.deepEqual(actual, expected)

  // globalOpenOrders is correct
  actual = engine.orders2Buy.sort(sort_CPASC_RateDESC_DtASC)
  expected = [
    {apiKey: 'others', currencyPair: 'BTC_ETH', dt: 1008, rate: 0.015, amount: 1 },
    {apiKey: 'others', currencyPair: 'BTC_LTC', dt: 1000, rate: 0.022, amount: 0 },
    {apiKey: 'others', currencyPair: 'BTC_LTC', dt: 1001, rate: 0.022, amount: 0.25 },
    {apiKey: 'others', currencyPair: 'BTC_LTC', dt: 1002, rate: 0.022, amount: 1 },
    {apiKey: 'others', currencyPair: 'BTC_LTC', dt: 1003, rate: 0.022, amount: 1 },
    {apiKey: 'others', currencyPair: 'BTC_LTC', dt: 1003, rate: 0.022, amount: 1 },
    {apiKey: 'others', currencyPair: 'BTC_LTC', dt: 1003, rate: 0.02, amount: 1 },
    {apiKey: 'others', currencyPair: 'BTC_LTC', dt: 1009, rate: 0.02, amount: 1}
  ]
  t.deepEqual(actual, expected)

  // 3. sell consumes 1/4 of dt 1001 (the remainder) and 3/4 of dt 1002.
  actual = engine.sell({apiKey:'me', currencyPair:'BTC_LTC', 'dt': 2000, rate: 0.019, amount: 1, immediateOrCancel:1})
  expected = {
    "orderNumber":"1",
    "resultingTrades":[
      {"amount":0.25,"date":"2017-10-07 11:55:18","rate":0.022,"total":0.0055,"tradeID":"1","type":"sell"},
      {"amount":0.75,"date":"2017-10-07 11:55:18","rate":0.022,"total":0.0165,"tradeID":"1","type":"sell"},
    ],
    amountUnfilled: 0,
  }
  t.deepEqual(actual, expected)

  // globalOpenOrders is correct
  actual = engine.orders2Buy.sort(sort_CPASC_RateDESC_DtASC)
  expected = [
    {apiKey: 'others', currencyPair: 'BTC_ETH', dt: 1008, rate: 0.015, amount: 1 },
    {apiKey: 'others', currencyPair: 'BTC_LTC', dt: 1000, rate: 0.022, amount: 0 },
    {apiKey: 'others', currencyPair: 'BTC_LTC', dt: 1001, rate: 0.022, amount: 0 },
    {apiKey: 'others', currencyPair: 'BTC_LTC', dt: 1002, rate: 0.022, amount: 0.25 },
    {apiKey: 'others', currencyPair: 'BTC_LTC', dt: 1003, rate: 0.022, amount: 1 },
    {apiKey: 'others', currencyPair: 'BTC_LTC', dt: 1003, rate: 0.022, amount: 1 },
    {apiKey: 'others', currencyPair: 'BTC_LTC', dt: 1003, rate: 0.02, amount: 1 },
    {apiKey: 'others', currencyPair: 'BTC_LTC', dt: 1009, rate: 0.02, amount: 1}
  ]
  t.deepEqual(actual, expected)

  // 4. consume all open orders >= 0.22 and 1/2 of 1003,0.020
  actual = engine.sell({apiKey:'me', currencyPair:'BTC_LTC', 'dt': 2000, rate: 0.020, amount: 2.75, immediateOrCancel:1})
  expected = {
    "orderNumber":"1",
    "resultingTrades":[
      { amount: 0.25, date: '2017-10-07 11:55:18', rate: 0.022, total: 0.0055, tradeID: '1', type: 'sell' },
      { amount: 1, date: '2017-10-07 11:55:18', rate: 0.022, total: 0.022, tradeID: '1', type: 'sell' },
      { amount: 1, date: '2017-10-07 11:55:18', rate: 0.022, total: 0.022, tradeID: '1', type: 'sell' },
      { amount: 0.5, date: '2017-10-07 11:55:18', rate: 0.020, total: 0.010, tradeID: '1', type: 'sell' }
    ],
    amountUnfilled: 0,
  }

  t.deepEqual(actual, expected)

  // globalOpenOrders is correct
  actual = engine.orders2Buy.sort(sort_CPASC_RateDESC_DtASC)
  expected = [
    {apiKey: 'others', currencyPair: 'BTC_ETH', dt: 1008, rate: 0.015, amount: 1 },
    {apiKey: 'others', currencyPair: 'BTC_LTC', dt: 1000, rate: 0.022, amount: 0 },
    {apiKey: 'others', currencyPair: 'BTC_LTC', dt: 1001, rate: 0.022, amount: 0 },
    {apiKey: 'others', currencyPair: 'BTC_LTC', dt: 1002, rate: 0.022, amount: 0 },
    {apiKey: 'others', currencyPair: 'BTC_LTC', dt: 1003, rate: 0.022, amount: 0 },
    {apiKey: 'others', currencyPair: 'BTC_LTC', dt: 1003, rate: 0.022, amount: 0},
    {apiKey: 'others', currencyPair: 'BTC_LTC', dt: 1003, rate: 0.02, amount: 0.5},
    {apiKey: 'others', currencyPair: 'BTC_LTC', dt: 1009, rate: 0.02, amount: 1}
  ]
  t.deepEqual(actual, expected)

  // 5. sell tries to consume more than is available at 0.19 but only gets what's available.
  actual = engine.sell({apiKey:'me', currencyPair:'BTC_LTC', 'dt': 2000, rate: 0.019, amount: 3, immediateOrCancel:1})
  expected = {
    orderNumber: '1',
    resultingTrades: [
      { amount: 0.5, date: '2017-10-07 11:55:18', rate: 0.02, total: 0.01, tradeID: '1', type: 'sell' },
      { amount: 1, date: '2017-10-07 11:55:18', rate: 0.02, total: 0.02, tradeID: '1', type: 'sell' }
    ],
    amountUnfilled: 1.5
  }

  t.deepEqual(actual, expected)

  // globalOpenOrders is correct. no change.
  actual = engine.orders2Buy.sort(sort_CPASC_RateDESC_DtASC)
  expected = [
    {apiKey: 'others', currencyPair: 'BTC_ETH', dt: 1008, rate: 0.015, amount: 1 },
    {apiKey: 'others', currencyPair: 'BTC_LTC', dt: 1000, rate: 0.022, amount: 0 },
    {apiKey: 'others', currencyPair: 'BTC_LTC', dt: 1001, rate: 0.022, amount: 0 },
    {apiKey: 'others', currencyPair: 'BTC_LTC', dt: 1002, rate: 0.022, amount: 0 },
    {apiKey: 'others', currencyPair: 'BTC_LTC', dt: 1003, rate: 0.022, amount: 0 },
    {apiKey: 'others', currencyPair: 'BTC_LTC', dt: 1003, rate: 0.022, amount: 0},
    {apiKey: 'others', currencyPair: 'BTC_LTC', dt: 1003, rate: 0.02, amount: 0},
    {apiKey: 'others', currencyPair: 'BTC_LTC', dt: 1009, rate: 0.02, amount: 0}
  ]
  t.deepEqual(actual, expected)

  // 6. After all of this, there should not be any sell orders on the books.
  actual = engine.orders2Sell.sort(sort_CPASC_RateDESC_DtASC)
  expected = []
  t.deepEqual(actual, expected)
})

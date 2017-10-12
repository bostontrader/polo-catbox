/*
This is a test of fillOrKill buy orders when talking directly to the tradeEngine.

Recall that fillOrKill means to fill the order in its entirety or nothing at all.

The basic drill for doing this is to iterate over all orders to sell, ordered by ask ASC, dt ASC, where ask <= the buy order rate. In this way, the lowest price sell offers are consumed first.  For all sell offers of the same ask, the offers are consumed from oldest to youngest.

*/
const test = require('ava')

const engine        = require('./tradeEngine')
const poloConstants = require('../poloConstants')

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
  // Because the focus of this test is fillOrKill buy orders, I will start by injecting this carefully crafted collection of sell orders to start with.  The actual sequence of injection should not matter because the engine will filter and sort, but this order is important in order to trigger edge cases of the test.
  // The BTC_ETH is added to muddy the water and should be excluded by the engine.
  engine.sell({apiKey:'others', currencyPair:'BTC_ETH', 'dt': 1008, rate: 0.020, amount: 1.0})
  //engine.sell({apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1007, rate: 0.027, amount: 1.0})
  //engine.sell({apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1006, rate: 0.026, amount: 1.0})
  engine.sell({apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1003, rate: 0.022, amount: 1.0})
  engine.sell({apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1003, rate: 0.020, amount: 1.0})
  engine.sell({apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1003, rate: 0.020, amount: 1.0})
  engine.sell({apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1009, rate: 0.022, amount: 1.0})
  engine.sell({apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1002, rate: 0.020, amount: 1.0})
  engine.sell({apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1000, rate: 0.020, amount: 1.0})
  engine.sell({apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1001, rate: 0.020, amount: 1.0})

  t.pass()
  let actual
  let expected

  // 1. Attempt to buy a price lower than dt 1000's price.  Should be no purchase.
  actual = engine.buy({apiKey:'me', currencyPair:'BTC_LTC', 'dt': 2000, rate: 0.019, amount: 1.0, fillOrKill:1})
  expected = { error: poloConstants.UNABLE_TO_FILL_ORDER_COMPLETELY }
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
    {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1009, rate: 0.022, amount: 1.0}
  ]
  t.deepEqual(actual, expected)

  // 2. buy consumes all of dt 1000 and 3/4 of dt 1001. Two sell orders at the same price, earliest order first.
  actual = engine.buy({apiKey:'me', currencyPair:'BTC_LTC', 'dt': 2000, rate: 0.023, amount: 1.75, fillOrKill:1})
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
    {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1009, rate: 0.022, amount: 1.0}
  ]
  t.deepEqual(actual, expected)


  // 3. buy consumes 1/4 of dt 1001 (the remainder) and 3/4 of dt 1002.
  actual = engine.buy({apiKey:'me', currencyPair:'BTC_LTC', 'dt': 2000, rate: 0.023, amount: 1, fillOrKill:1})
  expected = {
    "orderNumber":"1",
    "resultingTrades":[
      {"amount":0.25,"date":"2017-10-07 11:55:18","rate":0.02,"total":0.005,"tradeID":"1","type":"buy"},
      {"amount":0.75,"date":"2017-10-07 11:55:18","rate":0.02,"total":0.015,"tradeID":"1","type":"buy"}
    ]
  }
  t.deepEqual(actual, expected)

  // globalOpenOrders is correct
  actual = engine.orders2Sell.sort(sort_CPASC_RateASC_DtASC)
  expected = [
    {apiKey:'others', currencyPair:'BTC_ETH', 'dt': 1008, rate: 0.020, amount: 1.0},
    {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1000, rate: 0.020, amount: 0},
    {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1001, rate: 0.020, amount: 0},
    {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1002, rate: 0.020, amount: 0.25},
    {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1003, rate: 0.020, amount: 1.0},
    {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1003, rate: 0.020, amount: 1.0},
    {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1003, rate: 0.022, amount: 1.0},
    {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1009, rate: 0.022, amount: 1.0}
  ]
  t.deepEqual(actual, expected)

  // 4. consume all open orders < 0.22 and 1/2 of 1003,0.022
  actual = engine.buy({apiKey:'me', currencyPair:'BTC_LTC', 'dt': 2000, rate: 0.022, amount: 2.75, fillOrKill:1})
  expected = {
    "orderNumber":"1",
    "resultingTrades":[
      { amount: 0.25, date: '2017-10-07 11:55:18', rate: 0.02, total: 0.005, tradeID: '1', type: 'buy' },
      { amount: 1, date: '2017-10-07 11:55:18', rate: 0.02, total: 0.02, tradeID: '1', type: 'buy' },
      { amount: 1, date: '2017-10-07 11:55:18', rate: 0.02, total: 0.02, tradeID: '1', type: 'buy' },
      { amount: 0.5, date: '2017-10-07 11:55:18', rate: 0.022, total: 0.011, tradeID: '1', type: 'buy' }
    ]
  }

  t.deepEqual(actual, expected)

  // globalOpenOrders is correct
  actual = engine.orders2Sell.sort(sort_CPASC_RateASC_DtASC)
  expected = [
    {apiKey:'others', currencyPair:'BTC_ETH', 'dt': 1008, rate: 0.020, amount: 1.0},
    {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1000, rate: 0.020, amount: 0},
    {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1001, rate: 0.020, amount: 0},
    {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1002, rate: 0.020, amount: 0},
    {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1003, rate: 0.020, amount: 0},
    {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1003, rate: 0.020, amount: 0},
    {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1003, rate: 0.022, amount: 0.5},
    {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1009, rate: 0.022, amount: 1.0}
  ]
  t.deepEqual(actual, expected)

  // 5. buy tries to consume more than is available at 0.26 and gets nothing.
  actual = engine.buy({apiKey:'me', currencyPair:'BTC_LTC', 'dt': 2000, rate: 0.026, amount: 3, fillOrKill:1})
  expected = { error: poloConstants.UNABLE_TO_FILL_ORDER_COMPLETELY }
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
    {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1003, rate: 0.022, amount: 0.5},
    {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1009, rate: 0.022, amount: 1.0}
  ]
  t.deepEqual(actual, expected)

  // 6. buy exactly the remaining quantity of 1003, 0.22.
  actual = engine.buy({apiKey:'me', currencyPair:'BTC_LTC', 'dt': 2000, rate: 0.022, amount: 0.5, fillOrKill:1})
  expected = {
    orderNumber: '1',
    resultingTrades: [
      { amount: 0.5,
        date: '2017-10-07 11:55:18',
        rate: 0.022,
        total: 0.011,
        tradeID: '1',
        type: 'buy'
      }
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
    {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1003, rate: 0.022, amount: 0},
    {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1009, rate: 0.022, amount: 1.0}
  ]
  t.deepEqual(actual, expected)

})

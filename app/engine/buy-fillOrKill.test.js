/*
This is a test of fillOrKill buy orders when talking directly to the tradeEngine.

Recall that fillOrKill means to fill the order in its entirety or nothing at all.

The basic drill for doing this is to iterate over all orders to sell, ordered by ask ASC, dt ASC, where ask <= the buy order rate. In this way, the lowest price sell offers are consumed first.  For all sell offers of the same ask, the offers are consumed from oldest to youngest.

*/
const diff      = require('deep-diff')
const deepEqual = require('deep-equal')

const engine        = require('./tradeEngine')
const poloConstants = require('../poloConstants')

// Because the focus of this test is fillOrKill buy orders, I will start by injecting this carefully crafted collection of sell orders to start with.  The actual sequence of injection should not matter because the engine will filter and sort.
// The BTC_ETH is added to muddy the water and should be excluded by the engine.
engine.sell({apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1000, rate: 0.020, amount: 1.0})
engine.sell({apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1001, rate: 0.020, amount: 1.0})
engine.sell({apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1002, rate: 0.022, amount: 1.0})
engine.sell({apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1003, rate: 0.023, amount: 1.0})
engine.sell({apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1004, rate: 0.024, amount: 1.0})
engine.sell({apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1005, rate: 0.025, amount: 1.0})
engine.sell({apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1006, rate: 0.026, amount: 1.0})
engine.sell({apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1007, rate: 0.027, amount: 1.0})
engine.sell({apiKey:'others', currencyPair:'BTC_ETH', 'dt': 1008, rate: 0.020, amount: 1.0})

let actual
let expected

// 1. Attempt to buy a price lower than dt 1000's price.  Should be no purchase.
actual = engine.buy({apiKey:'me', currencyPair:'BTC_LTC', 'dt': 2000, rate: 0.019, amount: 1.0, fillOrKill:1})
expected = { error: poloConstants.UNABLE_TO_FILL_ORDER_COMPLETELY }
if(!deepEqual(actual, expected))
  throw new Error('Test fail. Expected:'+JSON.stringify(expected)+' Actual:'+JSON.stringify(actual))

// The orders 2 sell should be unchanged
actual = engine.orders2Sell
expected = [
  {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1000, rate: 0.020, amount: 1.0},
  {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1001, rate: 0.020, amount: 1.0},
  {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1002, rate: 0.022, amount: 1.0},
  {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1003, rate: 0.023, amount: 1.0},
  {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1004, rate: 0.024, amount: 1.0},
  {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1005, rate: 0.025, amount: 1.0},
  {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1006, rate: 0.026, amount: 1.0},
  {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1007, rate: 0.027, amount: 1.0},
  {apiKey:'others', currencyPair:'BTC_ETH', 'dt': 1008, rate: 0.020, amount: 1.0} ,
]
if(!deepEqual(actual, expected))
  throw new Error('Test fail. Expected:'+JSON.stringify(expected)+' Actual:'+JSON.stringify(actual))

// 2. buy consumes all of dt 1000 and 3/4 of dt 1001
actual = engine.buy({apiKey:'me', currencyPair:'BTC_LTC', 'dt': 2000, rate: 0.023, amount: 1.75, fillOrKill:1})
expected = {
  "orderNumber":"1",
  "resultingTrades":[
    {"amount":1,"date":"2017-10-07 11:55:18","rate":0.02,"total":0.02,"tradeID":"1","type":"buy"},
    {"amount":0.75,"date":"2017-10-07 11:55:18","rate":0.02,"total":0.015,"tradeID":"1","type":"buy"}
  ]
}
if(!deepEqual(actual, expected))
  throw new Error('Test fail. Expected:'+JSON.stringify(expected)+' Actual:'+JSON.stringify(actual))

// * globalOpenOrders is correct
actual = engine.orders2Sell
expected = [
  {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1000, rate: 0.020, amount: 0},
  {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1001, rate: 0.020, amount: 0.25},
  {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1002, rate: 0.022, amount: 1.0},
  {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1003, rate: 0.023, amount: 1.0},
  {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1004, rate: 0.024, amount: 1.0},
  {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1005, rate: 0.025, amount: 1.0},
  {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1006, rate: 0.026, amount: 1.0},
  {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1007, rate: 0.027, amount: 1.0},
  {apiKey:'others', currencyPair:'BTC_ETH', 'dt': 1008, rate: 0.020, amount: 1.0},
]
if(!deepEqual(engine.orders2Sell, expected))
  throw new Error('Test fail. Expected:'+JSON.stringify(expected)+' Actual:'+JSON.stringify(actual))


// 3. buy consumes 1/4 of dt 1001 (the remainder) and 3/4 of dt 1002.
actual = engine.buy({apiKey:'me', currencyPair:'BTC_LTC', 'dt': 2000, rate: 0.023, amount: 1, fillOrKill:1})
expected = {
  "orderNumber":"1",
  "resultingTrades":[
    {"amount":0.25,"date":"2017-10-07 11:55:18","rate":0.02,"total":0.005,"tradeID":"1","type":"buy"},
    {"amount":0.75,"date":"2017-10-07 11:55:18","rate":0.022,"total":0.0165,"tradeID":"1","type":"buy"}
  ]
}
if(!deepEqual(actual, expected))
  throw new Error('Test fail. Expected:'+JSON.stringify(expected)+' Actual:'+JSON.stringify(actual))

// * globalOpenOrders is correct
actual = engine.orders2Sell
expected = [
  {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1000, rate: 0.020, amount: 0},
  {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1001, rate: 0.020, amount: 0},
  {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1002, rate: 0.022, amount: 0.25},
  {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1003, rate: 0.023, amount: 1.0},
  {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1004, rate: 0.024, amount: 1.0},
  {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1005, rate: 0.025, amount: 1.0},
  {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1006, rate: 0.026, amount: 1.0},
  {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1007, rate: 0.027, amount: 1.0},
  {apiKey:'others', currencyPair:'BTC_ETH', 'dt': 1008, rate: 0.020, amount: 1.0},
]
if(!deepEqual(engine.orders2Sell, expected))
  throw new Error('Test fail. Expected:'+JSON.stringify(expected)+' Actual:'+JSON.stringify(actual))

// 4. buy consumes 1/4 of dt 1002 (the remainder) and all of dt 1003 and 3/4 of dt 1004.
actual = engine.buy({apiKey:'me', currencyPair:'BTC_LTC', 'dt': 2000, rate: 0.024, amount: 2, fillOrKill:1})
expected = {
  "orderNumber":"1",
  "resultingTrades":[
    {"amount":0.25,"date":"2017-10-07 11:55:18","rate":0.022,"total":0.0055,"tradeID":"1","type":"buy"},
    {"amount":1,"date":"2017-10-07 11:55:18","rate":0.023,"total":0.023,"tradeID":"1","type":"buy"},
    {"amount":0.75,"date":"2017-10-07 11:55:18","rate":0.024,"total":0.018000000000000002,"tradeID":"1","type":"buy"}
  ]
}

if(!deepEqual(actual, expected))
  throw new Error('Test fail. Expected:'+JSON.stringify(expected)+' Actual:'+JSON.stringify(actual))

// * globalOpenOrders is correct
actual = engine.orders2Sell
expected = [
  {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1000, rate: 0.020, amount: 0},
  {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1001, rate: 0.020, amount: 0},
  {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1002, rate: 0.022, amount: 0},
  {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1003, rate: 0.023, amount: 0},
  {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1004, rate: 0.024, amount: 0.25},
  {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1005, rate: 0.025, amount: 1.0},
  {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1006, rate: 0.026, amount: 1.0},
  {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1007, rate: 0.027, amount: 1.0},
  {apiKey:'others', currencyPair:'BTC_ETH', 'dt': 1008, rate: 0.020, amount: 1.0},
]
if(!deepEqual(engine.orders2Sell, expected))
  throw new Error('Test fail. Expected:'+JSON.stringify(expected)+' Actual:'+JSON.stringify(actual))

// 5. buy tries to consume more than is available at 0.26 and gets nothing.
actual = engine.buy({apiKey:'me', currencyPair:'BTC_LTC', 'dt': 2000, rate: 0.026, amount: 3, fillOrKill:1})
expected = { error: poloConstants.UNABLE_TO_FILL_ORDER_COMPLETELY }
if(!deepEqual(actual, expected))
  throw new Error('Test fail. Expected:'+JSON.stringify(expected)+' Actual:'+JSON.stringify(actual))

// * globalOpenOrders is correct. no change.
actual = engine.orders2Sell
expected = [
  {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1000, rate: 0.020, amount: 0},
  {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1001, rate: 0.020, amount: 0},
  {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1002, rate: 0.022, amount: 0},
  {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1003, rate: 0.023, amount: 0},
  {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1004, rate: 0.024, amount: 0.25},
  {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1005, rate: 0.025, amount: 1.0},
  {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1006, rate: 0.026, amount: 1.0},
  {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1007, rate: 0.027, amount: 1.0},
  {apiKey:'others', currencyPair:'BTC_ETH', 'dt': 1008, rate: 0.020, amount: 1.0},
]
if(!deepEqual(engine.orders2Sell, expected))
  throw new Error('Test fail. Expected:'+JSON.stringify(expected)+' Actual:'+JSON.stringify(actual))

console.log('buy-fillOrKill.test SUCCESS')

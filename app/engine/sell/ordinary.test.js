/*
This is a test of ordinary sell orders when talking directly to the tradeEngine.

Recall that 'ordinary' means no fillOrKill, immediateOrCancl, or postOnly.  In this case the order should be treated just like immediateOrCancel _except_ that any unfulfilled portion of the order is left on the books as a residual sell order.
*/
const test = require('ava')
const config = require('config')

const engine = require('../tradeEngine')
const sorters = require('../sorters')

test.serial(t => {
  const currencyPair = config.get('testData.markets')[0]
  const currencies = currencyPair.split('_')
  const baseCurrency = currencies[0]
  const quoteCurrency = currencies[1]
  engine.desiredTradeDate = Date.parse('2017-10-15 12:00:00')

  // Start by injecting this carefully crafted collection of buy orders to start with.  The actual sequence of injection should not matter because the engine will filter and sort, but this order is important in order to trigger edge cases of the test.
  // The BTC_ETH is added to muddy the water and should be excluded by the engine.
  engine.buy({apiKey: 'others', currencyPair: 'BTC_ETH', dt: 1008, rate: 0.015, amount: 1.0})
  engine.buy({apiKey: 'others', currencyPair, dt: 1003, rate: 0.020, amount: 1.0})
  engine.buy({apiKey: 'others', currencyPair, dt: 1003, rate: 0.022, amount: 1.0})
  engine.buy({apiKey: 'others', currencyPair, dt: 1003, rate: 0.022, amount: 1.0})
  engine.buy({apiKey: 'others', currencyPair, dt: 1009, rate: 0.020, amount: 1.0})
  engine.buy({apiKey: 'others', currencyPair, dt: 1002, rate: 0.022, amount: 1.0})
  engine.buy({apiKey: 'others', currencyPair, dt: 1000, rate: 0.022, amount: 1.0})
  engine.buy({apiKey: 'others', currencyPair, dt: 1001, rate: 0.022, amount: 1.0})

  let actual
  let expected

  // 1. Attempt to sell at a price higher than dt 1000's bid price.  Should be no sale and a new sell order should be posted.
  actual = engine.sell({apiKey: 'me', currencyPair, dt: 2000, rate: 0.023, amount: 1.0})
  expected = {orderNumber: '1', resultingTrades: []}
  t.deepEqual(actual, expected)

  // 1.1 Verify trades
  t.deepEqual(engine.trades, [])

  // 1.2 Verify orders to sell
  actual = engine.orders2Sell
  expected = [{apiKey: 'me', currencyPair, dt: 2000, rate: 0.023, amount: 1.0}]
  t.deepEqual(actual, expected)

  // 1.3 Verify orders to buy
  actual = engine.orders2Buy.sort(sorters.sortCurPairAscRateDescDatetimeAsc)
  expected = [
    {apiKey: 'others', currencyPair: 'BTC_ETH', dt: 1008, rate: 0.015, amount: 1.0},
    {apiKey: 'others', currencyPair, dt: 1000, rate: 0.022, amount: 1.0},
    {apiKey: 'others', currencyPair, dt: 1001, rate: 0.022, amount: 1.0},
    {apiKey: 'others', currencyPair, dt: 1002, rate: 0.022, amount: 1.0},
    {apiKey: 'others', currencyPair, dt: 1003, rate: 0.022, amount: 1.0},
    {apiKey: 'others', currencyPair, dt: 1003, rate: 0.022, amount: 1.0},
    {apiKey: 'others', currencyPair, dt: 1003, rate: 0.020, amount: 1.0},
    {apiKey: 'others', currencyPair, dt: 1009, rate: 0.020, amount: 1.0}
  ]
  t.deepEqual(actual, expected)

  // 2. sell consumes all of dt 1000 and 3/4 of dt 1001. Two buy orders at the same price, earliest order first.
  // This order is completely fulfilled so there is no residual buy order.
  actual = engine.sell({apiKey: 'me', currencyPair, dt: 2000, rate: 0.019, amount: 1.75})
  expected = {
    orderNumber: '1',
    resultingTrades: [
      {amount: 1, date: engine.desiredTradeDate, rate: 0.022, total: 0.022, tradeID: '1', type: 'sell', baseCurrency, quoteCurrency},
      {amount: 0.75, date: engine.desiredTradeDate, rate: 0.022, total: 0.0165, tradeID: '1', type: 'sell', baseCurrency, quoteCurrency}
    ]
  }
  t.deepEqual(actual, expected)

  // 2.1 Verify trades
  actual = engine.trades
  expected = [
    {amount: 1, date: engine.desiredTradeDate, rate: 0.022, total: 0.022, tradeID: '1', type: 'sell', baseCurrency, quoteCurrency},
    {amount: 0.75, date: engine.desiredTradeDate, rate: 0.022, total: 0.0165, tradeID: '1', type: 'sell', baseCurrency, quoteCurrency}
  ]
  t.deepEqual(actual, expected)

  // 2.2 Verify orders to sell
  actual = engine.orders2Sell
  expected = [{apiKey: 'me', currencyPair, dt: 2000, rate: 0.023, amount: 1.0}]
  t.deepEqual(actual, expected)

  // 2.3 Verify orders to buy
  actual = engine.orders2Buy.sort(sorters.sortCurPairAscRateDescDatetimeAsc)
  expected = [
    {apiKey: 'others', currencyPair: 'BTC_ETH', dt: 1008, rate: 0.015, amount: 1},
    {apiKey: 'others', currencyPair, dt: 1000, rate: 0.022, amount: 0},
    {apiKey: 'others', currencyPair, dt: 1001, rate: 0.022, amount: 0.25},
    {apiKey: 'others', currencyPair, dt: 1002, rate: 0.022, amount: 1},
    {apiKey: 'others', currencyPair, dt: 1003, rate: 0.022, amount: 1},
    {apiKey: 'others', currencyPair, dt: 1003, rate: 0.022, amount: 1},
    {apiKey: 'others', currencyPair, dt: 1003, rate: 0.02, amount: 1},
    {apiKey: 'others', currencyPair, dt: 1009, rate: 0.02, amount: 1}
  ]
  t.deepEqual(actual, expected)

  // 3. sell tries to consume more than is available at 0.022.  This will result in a residual sell order.
  actual = engine.sell({apiKey: 'me', currencyPair, dt: 2000, rate: 0.022, amount: 4})
  expected = {
    orderNumber: '1',
    resultingTrades: [
      {amount: 0.25, date: engine.desiredTradeDate, rate: 0.022, total: 0.0055, tradeID: '1', type: 'sell', baseCurrency, quoteCurrency},
      {amount: 1, date: engine.desiredTradeDate, rate: 0.022, total: 0.022, tradeID: '1', type: 'sell', baseCurrency, quoteCurrency},
      {amount: 1, date: engine.desiredTradeDate, rate: 0.022, total: 0.022, tradeID: '1', type: 'sell', baseCurrency, quoteCurrency},
      {amount: 1, date: engine.desiredTradeDate, rate: 0.022, total: 0.022, tradeID: '1', type: 'sell', baseCurrency, quoteCurrency}
    ]
  }
  t.deepEqual(actual, expected)

  // 3.1 Verify trades
  actual = engine.trades
  expected = [
    {amount: 1, date: engine.desiredTradeDate, rate: 0.022, total: 0.022, tradeID: '1', type: 'sell', baseCurrency, quoteCurrency},
    {amount: 0.75, date: engine.desiredTradeDate, rate: 0.022, total: 0.0165, tradeID: '1', type: 'sell', baseCurrency, quoteCurrency},
    {amount: 0.25, date: engine.desiredTradeDate, rate: 0.022, total: 0.0055, tradeID: '1', type: 'sell', baseCurrency, quoteCurrency},
    {amount: 1, date: engine.desiredTradeDate, rate: 0.022, total: 0.022, tradeID: '1', type: 'sell', baseCurrency, quoteCurrency},
    {amount: 1, date: engine.desiredTradeDate, rate: 0.022, total: 0.022, tradeID: '1', type: 'sell', baseCurrency, quoteCurrency},
    {amount: 1, date: engine.desiredTradeDate, rate: 0.022, total: 0.022, tradeID: '1', type: 'sell', baseCurrency, quoteCurrency}
  ]
  t.deepEqual(actual, expected)

  // 3.2 Verify orders to sell
  actual = engine.orders2Sell
  expected = [
    {apiKey: 'me', currencyPair, dt: 2000, rate: 0.023, amount: 1},
    {apiKey: 'me', currencyPair, dt: 2000, rate: 0.022, amount: 0.75}
  ]
  t.deepEqual(actual, expected)

  // 3.3 Verify orders to buy
  actual = engine.orders2Buy.sort(sorters.sortCurPairAscRateDescDatetimeAsc)
  expected = [
    {apiKey: 'others', currencyPair: 'BTC_ETH', dt: 1008, rate: 0.015, amount: 1},
    {apiKey: 'others', currencyPair, dt: 1000, rate: 0.022, amount: 0},
    {apiKey: 'others', currencyPair, dt: 1001, rate: 0.022, amount: 0},
    {apiKey: 'others', currencyPair, dt: 1002, rate: 0.022, amount: 0},
    {apiKey: 'others', currencyPair, dt: 1003, rate: 0.022, amount: 0},
    {apiKey: 'others', currencyPair, dt: 1003, rate: 0.022, amount: 0},
    {apiKey: 'others', currencyPair, dt: 1003, rate: 0.02, amount: 1},
    {apiKey: 'others', currencyPair, dt: 1009, rate: 0.02, amount: 1}
  ]
  t.deepEqual(actual, expected)
})

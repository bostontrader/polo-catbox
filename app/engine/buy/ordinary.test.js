/*
This is a test of ordinary buy orders when talking directly to the tradeEngine.

Recall that 'ordinary' means no fillOrKill, immediateOrCancl, or postOnly.  In this case the order should be treated just like immediateOrCancel _except_ that any unfulfilled portion of the order is left on the books as a residual buy order.
*/
const test = require('ava')
const config = require('config')

const engine = require('../tradeEngine')
const sorters = require('../sorters')

test(t => {
  let actual, expected
  const currencyPair = config.get('testData.markets')[0]
  const currencies = currencyPair.split('_')
  const baseCurrency = currencies[0]
  const quoteCurrency = currencies[1]

  // 1. In order to buy or sell anything we must first ensure sufficient funds.
  engine.makeDeposit('me', baseCurrency, 100)
  engine.makeDeposit('others', quoteCurrency, 100)
  engine.makeDeposit('others', 'ETH', 100)

  engine.desiredTradeDate = Date.parse('2017-10-15 12:00:00')

  // 2. Next, inject this carefully crafted collection of sell orders.  The actual sequence of injection should not matter because the engine will filter and sort, but this order is important in order to trigger edge cases of the test.
  // The BTC_ETH is added to muddy the water and should be excluded by the engine.
  engine.sell({apiKey: 'others', currencyPair: 'BTC_ETH', dt: 1008, rate: 0.020, amount: 1.0})
  engine.sell({apiKey: 'others', currencyPair, dt: 1003, rate: 0.022, amount: 1.0})
  engine.sell({apiKey: 'others', currencyPair, dt: 1003, rate: 0.020, amount: 1.0})
  engine.sell({apiKey: 'others', currencyPair, dt: 1009, rate: 0.027, amount: 1.0})
  engine.sell({apiKey: 'others', currencyPair, dt: 1003, rate: 0.020, amount: 1.0})
  engine.sell({apiKey: 'others', currencyPair, dt: 1009, rate: 0.022, amount: 1.0})
  engine.sell({apiKey: 'others', currencyPair, dt: 1002, rate: 0.020, amount: 1.0})
  engine.sell({apiKey: 'others', currencyPair, dt: 1000, rate: 0.020, amount: 1.0})
  engine.sell({apiKey: 'others', currencyPair, dt: 1001, rate: 0.020, amount: 1.0})

  // 3. Attempt to buy at a price lower than dt 1000's ask price.  Should be no purchase and a new buy order should be posted.
  actual = engine.buy({apiKey: 'me', currencyPair, dt: 2000, rate: 0.019, amount: 1.0})
  expected = {orderNumber: '1', resultingTrades: []}
  t.deepEqual(actual, expected)

  // 3.1 Verify trades
  t.deepEqual(engine.trades, [])

  // 3.2 Verify orders to buy
  actual = engine.orders2Buy
  expected = [{apiKey: 'me', currencyPair, dt: 2000, rate: 0.019, amount: 1.0}]
  t.deepEqual(actual, expected)

  // 3.3 Verify orders to sell
  actual = engine.orders2Sell.sort(sorters.sortCurPairAscRateAscDatetimeAsc)
  expected = [
    {apiKey: 'others', currencyPair: 'BTC_ETH', dt: 1008, rate: 0.020, amount: 1.0},
    {apiKey: 'others', currencyPair, dt: 1000, rate: 0.020, amount: 1.0},
    {apiKey: 'others', currencyPair, dt: 1001, rate: 0.020, amount: 1.0},
    {apiKey: 'others', currencyPair, dt: 1002, rate: 0.020, amount: 1.0},
    {apiKey: 'others', currencyPair, dt: 1003, rate: 0.020, amount: 1.0},
    {apiKey: 'others', currencyPair, dt: 1003, rate: 0.020, amount: 1.0},
    {apiKey: 'others', currencyPair, dt: 1003, rate: 0.022, amount: 1.0},
    {apiKey: 'others', currencyPair, dt: 1009, rate: 0.022, amount: 1.0},
    {apiKey: 'others', currencyPair, dt: 1009, rate: 0.027, amount: 1.0}
  ]
  t.deepEqual(actual, expected)

  // 4. buy consumes all of dt 1000 and 3/4 of dt 1001. Two sell orders at the same price, earliest order first.
  // This order is completely fulfilled so there is no residual buy order.
  actual = engine.buy({apiKey: 'me', currencyPair, dt: 2000, rate: 0.023, amount: 1.75})
  expected = {
    orderNumber: '1',
    resultingTrades: [
      {amount: 1, date: engine.desiredTradeDate, orderNumber: undefined, rate: 0.02, total: 0.02, tradeID: '1', type: 'buy', baseCurrency, quoteCurrency},
      {amount: 0.75, date: engine.desiredTradeDate, orderNumber: undefined, rate: 0.02, total: 0.015, tradeID: '1', type: 'buy', baseCurrency, quoteCurrency}
    ]
  }
  t.deepEqual(actual, expected)

  // 4.1 Verify trades
  actual = engine.trades
  expected = [
    {amount: 1, date: engine.desiredTradeDate, orderNumber: undefined, rate: 0.02, total: 0.02, tradeID: '1', type: 'buy', baseCurrency, quoteCurrency},
    {amount: 0.75, date: engine.desiredTradeDate, orderNumber: undefined, rate: 0.02, total: 0.015, tradeID: '1', type: 'buy', baseCurrency, quoteCurrency}
  ]
  t.deepEqual(actual, expected)

  // 4.2 Verify orders to buy
  actual = engine.orders2Buy
  expected = [{apiKey: 'me', currencyPair, dt: 2000, rate: 0.019, amount: 1.0}]
  t.deepEqual(actual, expected)

  // 4.3 Verify orders to sell
  actual = engine.orders2Sell.sort(sorters.sortCurPairAscRateAscDatetimeAsc)
  expected = [
    {apiKey: 'others', currencyPair: 'BTC_ETH', dt: 1008, rate: 0.020, amount: 1.0},
    {apiKey: 'others', currencyPair, dt: 1000, rate: 0.020, amount: 0},
    {apiKey: 'others', currencyPair, dt: 1001, rate: 0.020, amount: 0.25},
    {apiKey: 'others', currencyPair, dt: 1002, rate: 0.020, amount: 1.0},
    {apiKey: 'others', currencyPair, dt: 1003, rate: 0.020, amount: 1.0},
    {apiKey: 'others', currencyPair, dt: 1003, rate: 0.020, amount: 1.0},
    {apiKey: 'others', currencyPair, dt: 1003, rate: 0.022, amount: 1.0},
    {apiKey: 'others', currencyPair, dt: 1009, rate: 0.022, amount: 1.0},
    {apiKey: 'others', currencyPair, dt: 1009, rate: 0.027, amount: 1.0}
  ]
  t.deepEqual(actual, expected)

  // 5. buy tries to consume more than is available at 0.02.  This will result in a residual buy order.
  actual = engine.buy({apiKey: 'me', currencyPair, dt: 2000, rate: 0.02, amount: 4})
  expected = {
    orderNumber: '1',
    resultingTrades: [
      {amount: 0.25, date: engine.desiredTradeDate, orderNumber: undefined, rate: 0.02, total: 0.005, tradeID: '1', type: 'buy', baseCurrency, quoteCurrency},
      {amount: 1, date: engine.desiredTradeDate, orderNumber: undefined, rate: 0.02, total: 0.02, tradeID: '1', type: 'buy', baseCurrency, quoteCurrency},
      {amount: 1, date: engine.desiredTradeDate, orderNumber: undefined, rate: 0.02, total: 0.02, tradeID: '1', type: 'buy', baseCurrency, quoteCurrency},
      {amount: 1, date: engine.desiredTradeDate, orderNumber: undefined, rate: 0.02, total: 0.02, tradeID: '1', type: 'buy', baseCurrency, quoteCurrency}
    ]
  }
  t.deepEqual(actual, expected)

  // 5.1 Verify trades
  actual = engine.trades
  expected = [
    {amount: 1, date: engine.desiredTradeDate, orderNumber: undefined, rate: 0.02, total: 0.02, tradeID: '1', type: 'buy', baseCurrency, quoteCurrency},
    {amount: 0.75, date: engine.desiredTradeDate, orderNumber: undefined, rate: 0.02, total: 0.015, tradeID: '1', type: 'buy', baseCurrency, quoteCurrency},
    {amount: 0.25, date: engine.desiredTradeDate, orderNumber: undefined, rate: 0.02, total: 0.005, tradeID: '1', type: 'buy', baseCurrency, quoteCurrency},
    {amount: 1, date: engine.desiredTradeDate, orderNumber: undefined, rate: 0.02, total: 0.02, tradeID: '1', type: 'buy', baseCurrency, quoteCurrency},
    {amount: 1, date: engine.desiredTradeDate, orderNumber: undefined, rate: 0.02, total: 0.02, tradeID: '1', type: 'buy', baseCurrency, quoteCurrency},
    {amount: 1, date: engine.desiredTradeDate, orderNumber: undefined, rate: 0.02, total: 0.02, tradeID: '1', type: 'buy', baseCurrency, quoteCurrency}
  ]
  t.deepEqual(actual, expected)

  // 5.2 Verify orders to buy
  actual = engine.orders2Buy
  expected = [
    {apiKey: 'me', currencyPair, dt: 2000, rate: 0.019, amount: 1},
    {apiKey: 'me', currencyPair, dt: 2000, rate: 0.02, amount: 0.75}
  ]
  t.deepEqual(actual, expected)

  // 5.3 Verify orders to sell
  actual = engine.orders2Sell.sort(sorters.sortCurPairAscRateAscDatetimeAsc)
  expected = [
    {apiKey: 'others', currencyPair: 'BTC_ETH', dt: 1008, rate: 0.020, amount: 1.0},
    {apiKey: 'others', currencyPair, dt: 1000, rate: 0.020, amount: 0},
    {apiKey: 'others', currencyPair, dt: 1001, rate: 0.020, amount: 0},
    {apiKey: 'others', currencyPair, dt: 1002, rate: 0.020, amount: 0},
    {apiKey: 'others', currencyPair, dt: 1003, rate: 0.020, amount: 0},
    {apiKey: 'others', currencyPair, dt: 1003, rate: 0.020, amount: 0},
    {apiKey: 'others', currencyPair, dt: 1003, rate: 0.022, amount: 1.0},
    {apiKey: 'others', currencyPair, dt: 1009, rate: 0.022, amount: 1.0},
    {apiKey: 'others', currencyPair, dt: 1009, rate: 0.027, amount: 1.0}
  ]
  t.deepEqual(actual, expected)
})

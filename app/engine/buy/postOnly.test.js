/*
This is a test of postOnly buy orders when talking directly to the tradeEngine.

Recall that postOnly means to post an order only when none of it can be immediately executed.
*/
const test = require('ava')

const engine = require('../tradeEngine')
const poloConstants = require('../../poloConstants')
const sorters = require('../sorters')

test.serial(t => {
  const baseCurrency = 'BTC'
  const quoteCurrency = 'LTC'
  const currencyPair = baseCurrency + '_' + quoteCurrency

  // Start by injecting this carefully crafted collection of sell orders to start with.  The actual sequence of injection should not matter because the engine will filter and sort, but this order is important in order to trigger edge cases of the test.
  // The BTC_ETH is added to muddy the water and should be excluded by the engine.
  engine.sell({apiKey: 'others', currencyPair: 'BTC_ETH', dt: 1008, rate: 0.015, amount: 1.0})
  engine.sell({apiKey: 'others', currencyPair, dt: 1000, rate: 0.020, amount: 1.0})

  let actual
  let expected

  // 1. Set an order to buy at price > than dt 1000's ask price.  This would ordinarily result in a purchase, but in this case we don't want a purchase. Should be no purchase.
  actual = engine.buy({apiKey: 'me', currencyPair, dt: 2000, rate: 0.021, amount: 1.0, postOnly: 1})
  expected = {error: poloConstants.UNABLE_TO_PLACE_POSTONLY_ORDER_AT_THIS_PRICE}
  t.deepEqual(actual, expected)

  // 1.1 Verify trades
  t.deepEqual(engine.trades, [])

  // 1.2 Verify orders to buy
  t.deepEqual(engine.orders2Buy, [])

  // 1.3 Verify orders to sell
  actual = engine.orders2Sell.sort(sorters.sortCurPairAscRateAscDatetimeAsc)
  expected = [
    {apiKey: 'others', currencyPair: 'BTC_ETH', dt: 1008, rate: 0.015, amount: 1.0},
    {apiKey: 'others', currencyPair, dt: 1000, rate: 0.020, amount: 1.0}
  ]
  t.deepEqual(actual, expected)

  // 2. Set an order to buy at price = dt 1000's ask price.  This would ordinarily result in a purchase, but in this case we don't want a purchase. Should be no purchase.
  actual = engine.buy({apiKey: 'me', currencyPair, dt: 2000, rate: 0.020, amount: 1.0, postOnly: 1})
  expected = {error: poloConstants.UNABLE_TO_PLACE_POSTONLY_ORDER_AT_THIS_PRICE}
  t.deepEqual(actual, expected)

  // 2.1 Verify trades
  t.deepEqual(engine.trades, [])

  // 2.2 Verify orders to buy
  t.deepEqual(engine.orders2Buy, [])

  // 2.3 Verify orders to sell
  actual = engine.orders2Sell.sort(sorters.sortCurPairAscRateAscDatetimeAsc)
  expected = [
    {apiKey: 'others', currencyPair: 'BTC_ETH', dt: 1008, rate: 0.015, amount: 1.0},
    {apiKey: 'others', currencyPair, dt: 1000, rate: 0.020, amount: 1.0}
  ]
  t.deepEqual(actual, expected)

  // 3. Set an order to buy at price < than dt 1000's ask price.  This will not result in a purchase, and that's what we want.
  actual = engine.buy({apiKey: 'me', currencyPair, dt: 2000, rate: 0.018, amount: 1.0, postOnly: 1})
  expected = {orderNumber: '1', resultingTrades: []}
  t.deepEqual(actual, expected)

  // 3.1 Verify trades
  t.deepEqual(engine.trades, [])

  // 3.2 Verify orders to buy
  t.deepEqual(
    engine.orders2Buy,
    [{apiKey: 'me', currencyPair, dt: 2000, rate: 0.018, amount: 1, postOnly: 1}]
  )

  // 3.3 Verify orders to sell
  actual = engine.orders2Sell.sort(sorters.sortCurPairAscRateAscDatetimeAsc)
  expected = [
    {apiKey: 'others', currencyPair: 'BTC_ETH', dt: 1008, rate: 0.015, amount: 1.0},
    {apiKey: 'others', currencyPair, dt: 1000, rate: 0.020, amount: 1.0}
  ]
  t.deepEqual(actual, expected)
})

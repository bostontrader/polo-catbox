/*
This is a test of postOnly sell orders when talking directly to the tradeEngine.

Recall that postOnly means to post an order only when none of it can be immediately executed.
*/
const test = require('ava')

const engine        = require('../tradeEngine')
const poloConstants = require('../../poloConstants')

// The sell orders that we use for testing will be injected into the engine state in a particular order designed to trip over edge cases.  However, this order makes it extremely tedious to observe changes to the orders as this test proceeds.  This function will enable us to easily sort the sell orders, purely as a convenience.
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
  engine.buy({apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1000, rate: 0.020, amount: 1.0})

  let actual
  let expected

  // 1. Set an order to sell at price < than dt 1000's bid price.  This would ordinarily result in a sale, but in this case we don't want a sale. Should be no purchase.
  actual = engine.sell({apiKey:'me', currencyPair:'BTC_LTC', 'dt': 2000, rate: 0.018, amount: 1.0, postOnly:1})
  expected = { error: poloConstants.UNABLE_TO_PLACE_POSTONLY_ORDER_AT_THIS_PRICE }
  t.deepEqual(actual, expected)

  // 2. Set an order to sell at price = dt 1000's bid price.  This would ordinarily result in a sale, but in this case we don't want a sale. Should be no purchase.
  actual = engine.sell({apiKey:'me', currencyPair:'BTC_LTC', 'dt': 2000, rate: 0.020, amount: 1.0, postOnly:1})
  expected = { error: poloConstants.UNABLE_TO_PLACE_POSTONLY_ORDER_AT_THIS_PRICE }
  t.deepEqual(actual, expected)

  // The orders to buy should be unchanged
  actual = engine.orders2Buy.sort(sort_CPASC_RateDESC_DtASC)
  expected = [
    {apiKey:'others', currencyPair:'BTC_ETH', 'dt': 1008, rate: 0.015, amount: 1.0},
    {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1000, rate: 0.020, amount: 1.0}
  ]
  t.deepEqual(actual, expected)

  // 3. Set an order to sell at price > than dt 1000's bid price.  This will not result in a sale, and that's what we want.
  actual = engine.sell({apiKey:'me', currencyPair:'BTC_LTC', 'dt': 2000, rate: 0.022, amount: 1.0, postOnly:1})
  expected = {orderNumber: '1', resultingTrades: [] }
  t.deepEqual(actual, expected)

  // The orders to buy should be unchanged
  actual = engine.orders2Buy.sort(sort_CPASC_RateDESC_DtASC)
  expected = [
    {apiKey:'others', currencyPair:'BTC_ETH', 'dt': 1008, rate: 0.015, amount: 1.0},
    {apiKey:'others', currencyPair:'BTC_LTC', 'dt': 1000, rate: 0.020, amount: 1.0}
  ]
  t.deepEqual(actual, expected)

  // The orders to sell should have a new order
  actual = engine.orders2Sell.sort(sort_CPASC_RateDESC_DtASC)
  expected = [{apiKey: 'me', currencyPair: 'BTC_LTC', dt: 2000, rate: 0.022, amount: 1, postOnly: 1 }]
  t.deepEqual(actual, expected)

})

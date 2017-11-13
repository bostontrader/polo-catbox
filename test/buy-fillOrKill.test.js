const deepEqual = require('deep-equal')

const poloConstants = require('../app/poloConstants')

module.exports = async (poloAdapter, server) => {

  // fillOrKill. All or nothing.

  // 1a. Start with zero offers to sell.  (A thinly traded real market might have zero offers to sell.)

  // 1b. fillOrKill any rate.  reject.
  await poloAdapter.sell({currencyPair:'BTC_LTC', rate:0.002, amount:0.05})

  // 1c. Don't bother trying to test any other quantity.

  // 2a. Start with one offer to sell.
  await poloAdapter.sell({currencyPair:'BTC_LTC', rate:0.002, amount:0.05})

  // 2b. fillOrKill, rate too low
  await poloAdapter.buy({currencyPair:'BTC_LTC', rate:0.001, amount:0.05, fillOrKill:1})

  // 2d. fillOrKill < available quantity.  Order sb filled, quantity drops, fee = 0.25
  await poloAdapter.buy({currencyPair:'BTC_LTC', rate:0.001, amount:0.05, fillOrKill:1})

  // 2c. fillOrKill > quantity available.  Nothing is purchased.
  await poloAdapter.buy({currencyPair:'BTC_LTC', rate:0.001, amount:0.05, fillOrKill:1})

  // 3a. Start with three offers to sell at the same price.
  await poloAdapter.sell({currencyPair:'BTC_LTC', rate:0.002, amount:0.05})
  await poloAdapter.sell({currencyPair:'BTC_LTC', rate:0.002, amount:0.05})

  // 3b. fillOrKill for all of 1st order and 1/2 of 2nd order.  1st order goes away, 2nd order is changed, 3rd unchanged. fee = 0.25
  await poloAdapter.buy({currencyPair:'BTC_LTC', rate:0.001, amount:0.05, fillOrKill:1})


  // 3d. fillOrKill for remainder of #2 and 1/2 of #3.  2nd order goes away, 3rd order is changed, some amount remaining. fee = 0.25
  await poloAdapter.buy({currencyPair:'BTC_LTC', rate:0.001, amount:0.05, fillOrKill:1})

  // 3c. fillOrKill for > quantity available. Nothing is purchased.  We've already tested this. Don't to it again.

  return Promise.resolve(true)
}

const deepEqual = require('deep-equal')

const poloConstants = require('../app/poloConstants')

module.exports = async (poloAdapter) => {

  const theTest = async (parameters, announcement, expectedError) => {
    console.log(announcement)
    const actual   = await poloAdapter.sell(parameters)
    const expected = {"error":expectedError}
    if(!deepEqual(actual, expected))
      return Promise.reject('sell failed its test. Expected:'+JSON.stringify(expected)+' Actual:'+JSON.stringify(actual))
  }

  await theTest({}, 'testing sell with no parameters', poloConstants.TOTAL_MUST_BE_AT_LEAST_0_0001)
  await theTest({rate:'a'}, 'testing sell with a non-numeric rate', poloConstants.INVALID_RATE_PARAMETER)
  await theTest({rate:-5}, 'testing sell with a negative rate', poloConstants.INVALID_RATE_PARAMETER)
  await theTest({amount:'a'}, 'testing sell with a non-numeric amount', poloConstants.INVALID_AMOUNT_PARAMETER)
  await theTest({amount:-5}, 'testing sell with a negative amount', poloConstants.INVALID_AMOUNT_PARAMETER)
  await theTest({rate:0.002,amount:0.05}, 'testing sell with a missing currencyPair', poloConstants.REQUIRED_PARAMETER_MISSING)

  // Invalid currency pair. Any variation that's not in our collection of markets.
  await theTest({currencyPair:'a', rate:0.002,amount:0.05}, 'testing sell with a variation of invalid currency pair', poloConstants.INVALID_CURRENCY_PAIR_PARAMETER)
  await theTest({currencyPair:'BTC_ltc', rate:0.002,amount:0.05}, 'testing sell with a variation of invalid currency pair', poloConstants.INVALID_CURRENCY_PAIR_PARAMETER)
  await theTest({currencyPair:'BTC_CLAM', rate:0.002,amount:0.05}, 'testing sell with a variation of invalid currency pair', poloConstants.INVALID_CURRENCY_PAIR_PARAMETER)

  await theTest({currencyPair:'BTC_LTC', rate:1.0, amount:5000}, 'testing sell with not enough money to sell', poloConstants.NOT_ENOUGH + " LTC.")
  await theTest({currencyPair:'BTC_LTC', rate:1.0, amount:100, immediateOrCancel:1, postOnly:1}, 'testing sell with too many flags', poloConstants.NO_MORE_THAN_ONE)

  return Promise.resolve(true)
}

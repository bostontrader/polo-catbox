const deepEqual = require('deep-equal')

const poloConstants = require('../app/poloConstants')

module.exports = async (poloAdapter) => {

  let actual
  let expected

  const theTest = async (parameters, announcement, expectedError) => {
    console.log(announcement)
    actual   = await poloAdapter.buy(parameters)
    expected = {"error":expectedError}
    if(!deepEqual(actual, expected))
      return Promise.reject('buy failed its test. Expected:'+JSON.stringify(expected)+' Actual:'+JSON.stringify(actual))
  }

  await theTest({}, 'testing buy with no parameters', poloConstants.TOTAL_MUST_BE_AT_LEAST_0_0001)
  await theTest({rate:'a'}, 'testing buy with a non-numeric rate', poloConstants.INVALID_RATE_PARAMETER)
  await theTest({amount:'a'}, 'testing buy with a non-numeric amount', poloConstants.INVALID_AMOUNT_PARAMETER)
  await theTest({rate:0.002,amount:0.05}, 'testing buy with a missing currencyPair', poloConstants.REQUIRED_PARAMETER_MISSING)

  // Invalid currency pair. Any variation that's not in our collection of markets.
  await theTest({currencyPair:'a', rate:0.002,amount:0.05}, 'testing buy with a variation of invalid currency pair', poloConstants.INVALID_CURRENCY_PAIR_PARAMETER)
  await theTest({currencyPair:'BTC_ltc', rate:0.002,amount:0.05}, 'testing buy with a variation of invalid currency pair', poloConstants.INVALID_CURRENCY_PAIR_PARAMETER)
  await theTest({currencyPair:'BTC_CLAM', rate:0.002,amount:0.05}, 'testing buy with a variation of invalid currency pair', poloConstants.INVALID_CURRENCY_PAIR_PARAMETER)

  return Promise.resolve(true)
}

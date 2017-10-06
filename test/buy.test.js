const deepEqual = require('deep-equal')

const poloConstants = require('../app/poloConstants')

module.exports = async (poloAdapter) => {

  let actual
  let expected

  // 1. No parameters. Expect an error message.
  console.log('testing buy with no parameters')
  actual   = await poloAdapter.buy({})
  expected = {"error":poloConstants.TOTAL_MUST_BE_AT_LEAST_0_0001}
  if(!deepEqual(actual, expected))
    return Promise.reject('buy failed its test. Expected:'+JSON.stringify(expected)+' Actual:'+JSON.stringify(actual))

  // 2. Non-numeric rate.  Expect an error message.
  console.log('testing buy with a non-numeric rate')
  actual   = await poloAdapter.buy({rate:'a'})
  expected = {"error":poloConstants.INVALID_RATE_PARAMETER}
  if(!deepEqual(actual, expected))
    return Promise.reject('buy failed its test. Expected:'+JSON.stringify(expected)+' Actual:'+JSON.stringify(actual))

  // 3. Non-numeric amount.  Expect an error message.
  console.log('testing buy with a non-numeric amount')
  actual   = await poloAdapter.buy({amount:'a'})
  expected = {"error":poloConstants.INVALID_AMOUNT_PARAMETER}
  if(!deepEqual(actual, expected))
    return Promise.reject('buy failed its test. Expected:'+JSON.stringify(expected)+' Actual:'+JSON.stringify(actual))

  // 4. Missing currency pair.
  console.log('testing buy with a missing currency pair')
  actual   = await poloAdapter.buy({rate:0.002,amount:0.05})
  expected = {"error":poloConstants.REQUIRED_PARAMETER_MISSING}
  if(!deepEqual(actual, expected))
    return Promise.reject('buy failed its test. Expected:'+JSON.stringify(expected)+' Actual:'+JSON.stringify(actual))

  return Promise.resolve(true)
}

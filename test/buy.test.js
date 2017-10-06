const deepEqual = require('deep-equal')

const poloConstants = require('../app/poloConstants')

module.exports = async (poloAdapter) => {

  // 1. Buy with no parameters. Expect an error message.
  console.log('testing buy with no parameters')
  const result = await poloAdapter.buy({})
  return new Promise((resolve, reject) => {
    if(deepEqual(result, {"error":poloConstants['TOTAL_MUST_BE_AT_LEAST_0.0001']}))
      resolve(true)
    else {
      reject('buy failed its test')
    }
  })
}

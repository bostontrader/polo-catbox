const config    = require('config')
const deepEqual = require('deep-equal')

// There are no input parameters for this endpoint.  EZ.
module.exports = async (poloAdapter) => {
  console.log('testing returnCurrencies')

  const result = await poloAdapter.returnCurrencies()

  return new Promise((resolve, reject) => {
    if(deepEqual(result, config.get('testData.currencies')))
      resolve(true)
    else
      reject('returnCurrencies failed its test')
  })
}

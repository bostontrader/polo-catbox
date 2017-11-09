const config = require('config')

// Return the collection of balances for each currency, for a given user.
module.exports = (user, deposits) => {
  // for each currency, compute total of deposits for the given user
  let retVal = {}
  Object.keys(config.get('testData.currencies')).forEach(currency => {
    const n1 = deposits.filter(deposit => deposit.user === user && deposit.currency === currency)
    const n2 = n1.reduce(function(sum, deposit) {
      return sum + deposit.amount
    }, 0)
    // console.log(11, currency, n2)
    retVal[currency] = n2
  })
  return retVal
}

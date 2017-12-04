const config = require('config')

// Return the collection of balances for each currency, for a given user.
module.exports = (user, deposits, withdrawals) => {
  // For each currency, compute total of all transactions for the given user.  At this time we only include deposits and withdrawals.  This is grossly incomplete.
  let retVal = {}
  Object.keys(config.get('testData.currencies')).forEach(currency => {
    const n1 = deposits.filter(deposit => deposit.user === user && deposit.currency === currency)
    const n2 = withdrawals.filter(withdrawal => withdrawal.user === user && withdrawal.currency === currency)

    const n3 =
      n1.reduce(function (sum, deposit) {
        return sum + deposit.amount
      }, 0) -
      n2.reduce(function (sum, withdrawal) {
        return sum + withdrawal.amount
      }, 0)

    retVal[currency] = n3
  })
  return retVal
}

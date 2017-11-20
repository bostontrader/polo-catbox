// Given a user and some amount of some currency, make a deposit into the exchange.
module.exports = (user, currency, amount, datetime, deposits) => {
  deposits.push({user, currency, amount, datetime})
  const retVal = {success: 1}
  return retVal
}

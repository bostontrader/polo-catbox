// Given a user and some amount of some currency, make a deposit into the exchange.
module.exports = (user, currency, amount, deposits) => {
  deposits.push({user, currency, amount})
  const retVal = {success: 1}
  return retVal
}

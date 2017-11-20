module.exports = (user, currency, amount, address, datetime, withdrawals) => {
  withdrawals.push({user, currency, amount, address, datetime})
  const retVal = {success: 1}
  return retVal
}

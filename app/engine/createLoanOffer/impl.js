module.exports = (user, currency, amount, duration, autoRenew, lendingRate, date, orderID, loans) => {
  loans.push({user, currency, rate: lendingRate, amount, rangeMin: duration, rangeMax: 0, autoRenew, date, orderID, open: 1})
  const retVal = {success: 1, message: 'Loan order placed.', orderID}
  return retVal
}

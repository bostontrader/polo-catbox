module.exports = (user, currency, amount, duration, autoRenew, lendingRate, date, loans) => {
  loans.push({user, currency, rate: lendingRate, amount, rangeMin: duration, rangeMax: 0, autoRenew, date})
  const retVal = {success: 1, message: 'Loan order placed.', orderID: 666}
  return retVal
}

module.exports = (borrower, loanID, startDate, loanOffers) => {
  loanOffers.filter(offer => offer.loanID === loanID) // should only be 1
    .map(offer => {
      offer.startDate = startDate
    })
  return {'success': 1}
}

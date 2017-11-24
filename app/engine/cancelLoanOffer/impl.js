const c = require('../../poloConstants')

module.exports = (user, loanID, loanOffers) => {
  const theRelevantOffer = loanOffers.filter(offer => (offer.open && offer.user === user && offer.loanID === loanID))

  if (theRelevantOffer.length === 0) return {success: 0, error: c.cancelLoanOffer.ERROR_OR_NOT_YOU}
  else if (theRelevantOffer.length === 1) {
    theRelevantOffer[0].open = 0 // close this offer
    return {success: 1, message: c.cancelLoanOffer.CANCELED, amount: theRelevantOffer[0].amount}
  } else return 'maxfubar error' // This should only happen if there are two or more identical orders. ie. never.
}

module.exports = (orderNumber, endDate, loanOffers) => {
  const rounder = (number, precision) => Number(Math.round(number + 'e' + precision) + 'e-' + precision)

  loanOffers.filter(offer => offer.loanID === orderNumber && ('startDate' in offer)) // should only be 1
    .map(offer => {
      offer.endDate = endDate
      offer.duration = rounder((offer.endDate - offer.startDate) / 86400, 8)
      offer.interest = rounder(offer.rate * offer.duration * offer.amount, 8)
      offer.fee = -rounder(offer.interest * 0.15, 8)
      offer.earned = offer.interest + offer.fee
    })
  return {'success': 1}
}

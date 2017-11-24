var dateFormat = require('dateformat')

module.exports = (user, start, end, limit, loanOffers) => {
  let retVal = []
  const truncateOrPad2String = (n) => {
    const pad = '.00000000'
    const s = n.toString()
    const idx = s.indexOf('.')

    // 1. If no . assume integer value and simply append pad
    if (idx < 0) { return s + pad }

    // 2. Quantity of pad to append
    const padQ = 8 - (s.length - (idx + 1))

    // 3. If the quantity === 0 then the number is already exactly 8 decimal places long.
    if (padQ === 0) { return s }

    // 4. If the quantity < 0 this means that the number is more than 8 decimal places.  Truncate.
    if (padQ < 0) { return s.substring(0, s.length + padQ) }

    // 5. The number has < 8 decimal places, so pad it.
    return s + pad.substr(-padQ)
  }

  const n1 = loanOffers.filter(offer => 'endDate' in offer && start <= offer.endDate && offer.endDate <= end)

  n1.forEach(offer => {
    const xformOffer = {
      id: offer.loanID,
      currency: offer.currency,
      rate: truncateOrPad2String(offer.rate),
      amount: truncateOrPad2String(offer.amount),
      duration: truncateOrPad2String(offer.duration),
      interest: truncateOrPad2String(offer.interest),
      fee: truncateOrPad2String(offer.fee),
      earned: truncateOrPad2String(offer.earned),
      open: dateFormat(offer.startDate * 1000, 'yyyy-mm-dd HH:MM:ss', true),
      close: dateFormat(offer.endDate * 1000, 'yyyy-mm-dd HH:MM:ss', true)
    }
    retVal.push(xformOffer)
  })
  return retVal
}

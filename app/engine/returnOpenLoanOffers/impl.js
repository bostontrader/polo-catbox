module.exports = (user, loanOffers) => {
  const relevantOffers = loanOffers.filter(offer => offer.user === user)
  if (relevantOffers.length === 0) return []
  let retVal = {}
  relevantOffers.forEach(offer => {
    const newOffer = {id: 666, rate: offer.rate, amount: offer.amount, duration: offer.rangeMin, autoRenew: offer.autoRenew, date: offer.date}
    if (!(offer.currency in retVal)) { retVal[offer.currency] = [] }
    retVal[offer.currency].push(newOffer)
  })
  return retVal
  /*

    //t.deepEqual(loanOffers.BTC,{ id: 667855885,
      //rate: '0.00010000',
      //amount: '0.01000000',
      //duration: 2,
      //autoRenew: 1,
      //date: '2017-11-11 08:37:36' })

   */
}

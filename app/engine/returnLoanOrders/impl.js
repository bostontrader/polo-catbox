module.exports = (offers, demands) => {
  return {
    offers: offers.map(offer => {
      return {rate: offer.rate, amount: offer.amount, rangeMin: offer.rangeMin, rangeMax: offer.rangeMax}
    }),
    demands: demands.map(offer => {
      return {rate: offer.rate, amount: offer.amount, rangeMin: offer.rangeMin, rangeMax: offer.rangeMax}
    })
  }
}

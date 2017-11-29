// We need to use the same sort functions in many places.
module.exports = {

  sortCurPairAscRateAscDatetimeAsc: (a, b) => {
    if (a.currencyPair < b.currencyPair) return -1
    if (a.currencyPair > b.currencyPair) return 1

    if (a.rate < b.rate) return -1
    if (a.rate > b.rate) return 1

    // a.rate must be equal to b.rate. Now sort by dt
    if (a.dt < b.dt) return -1
    if (a.dt > b.dt) return 1

    // a.dt must be equal to b.dt.
    return 0
  },

  sortCurPairAscRateDescDatetimeAsc: (a, b) => {
    if (a.currencyPair < b.currencyPair) return -1
    if (a.currencyPair > b.currencyPair) return 1

    if (a.rate > b.rate) return -1
    if (a.rate < b.rate) return 1

    // a.rate must be equal to b.rate. Now sort by dt
    if (a.dt < b.dt) return -1
    if (a.dt > b.dt) return 1

    // a.dt must be equal to b.dt.
    return 0
  },

  sortRateAscDatetimeAsc: (a, b) => {
    if (a.rate < b.rate) return -1
    if (a.rate > b.rate) return 1

    // a.rate must be equal to b.rate. Now sort by dt
    if (a.dt < b.dt) return -1
    if (a.dt > b.dt) return 1

    // a.dt must be equal to b.dt.
    return 0
  },

  // Sort an array by rate DESC, Dt ASC. This is intended to sort an array of buy orders.
  sortRateDescDatetimeAsc: (a, b) => {
    if (a.rate > b.rate) return -1
    if (a.rate < b.rate) return 1

    // a.rate must be equal to b.rate. Now sort by dt
    if (a.dt < b.dt) return -1
    if (a.dt > b.dt) return 1

    // a.dt must be equal to b.dt.
    return 0
  }
}

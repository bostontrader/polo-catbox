module.exports = (markets, orders2Buy, orders2Sell, trades) => {
  const retVal = {}
  let id = 0

  markets.forEach(market => {
    const ticker = {}
    ticker.id = id++
    ticker.isFrozen = 0
    ticker.lowestAsk = undefined
    ticker.highestBid = undefined
    ticker.last = undefined
    ticker.percentChange = undefined
    ticker.baseVolume = undefined
    ticker.quoteVolume = undefined
    ticker.high24hr = undefined
    ticker.low24hr = undefined
    retVal[market] = ticker

    // Sort buy orders with the highest bid on top
    const sortRateDesc = function (a, b) {
      if (a.rate > b.rate) return -1
      if (a.rate < b.rate) return 1
      return 0
    }

    // Sort sell orders with the lowest ask on top
    const sortRateAsc = function (a, b) {
      if (a.rate < b.rate) return -1
      if (a.rate > b.rate) return 1
      return 0
    }

    // Sort trades with the most recent trade on top
    const sortDtDesc = function (a, b) {
      if (a.rate > b.rate) return -1
      if (a.rate < b.rate) return 1
      return 0
    }

    // highestBid
    const n1 = orders2Buy
      .filter(existingOrder => existingOrder.currencyPair === market)
      .filter(existingOrder => existingOrder.amount > 0)
      .sort(sortRateDesc)
    if (n1.length > 0) { ticker.highestBid = n1[0].rate }

    // lowestAsk
    const n2 = orders2Sell
      .filter(existingOrder => existingOrder.currencyPair === market)
      .filter(existingOrder => existingOrder.amount > 0)
      .sort(sortRateAsc)
    if (n2.length > 0) { ticker.lowestAsk = n2[0].rate }

    // trades
    const marketCurrencies = market.split('_')
    const n3 = trades
      .filter(trade => trade.baseCurrency === marketCurrencies[0])
      .filter(trade => trade.quoteCurrency === marketCurrencies[1])
      .sort(sortDtDesc)
    if (n3.length > 0) { ticker.last = n3[0].rate }
    n3.forEach(trade => {
      ticker.baseVolume = ticker.baseVolume ? ticker.baseVolume += trade.total : trade.total
      ticker.quoteVolume = ticker.quoteVolume ? ticker.quoteVolume += trade.amount : trade.amount
      if (!ticker.high24hr || ticker.high24hr < trade.rate) { ticker.high24hr = trade.rate }
      if (!ticker.low24hr || ticker.low24hr > trade.rate) { ticker.low24hr = trade.rate }
    })

    retVal[market] = ticker
  })

  return retVal
}

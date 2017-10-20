module.exports = (orders2Buy, orders2Sell) => {
  let retVal = {}
  let depthElement

  // We don't really need to sort by dt, but doing so is harmless and this function is identical to other functions of the same name, in other places.  This is a good candidate to factor out.
  const sortCurPairAscRateDescDatetimeAsc = function (a, b) {
    if (a.currencyPair < b.currencyPair) return -1
    if (a.currencyPair > b.currencyPair) return 1

    if (a.rate > b.rate) return -1
    if (a.rate < b.rate) return 1

    // a.rate must be equal to b.rate. Now sort by dt
    if (a.dt < b.dt) return -1
    if (a.dt > b.dt) return 1

    // a.dt must be equal to b.dt.
    return 0
  }

  // We don't really need to sort by dt, but doing so is harmless and this function is identical to other functions of the same name, in other places.  This is a good candidate to factor out.
  const sortCurPairAscRateAscDatetimeAsc = function (a, b) {
    if (a.currencyPair < b.currencyPair) return -1
    if (a.currencyPair > b.currencyPair) return 1

    if (a.rate < b.rate) return -1
    if (a.rate > b.rate) return 1

    // a.rate must be equal to b.rate. Now sort by dt
    if (a.dt < b.dt) return -1
    if (a.dt > b.dt) return 1

    // a.dt must be equal to b.dt.
    return 0
  }

  // Given an array of buy or sell orders, a suitable sort function, the orderBook that we are building, and the key within the orderBook for new order depth elements, analyze the orders and incorporate the suitable order depth elements into the orderBook
  const analyzeOrders = (orders, sorter, orderBook, orderBookKey) => {
    let priorMarket
    let priorRate
    let market // market aka currencyPair
    orders.sort(sorter).forEach(order => {
      const currencies = order.currencyPair.split('_')
      const base = currencies[0]
      const quote = currencies[1]
      market = base + '_' + quote

      if (market === priorMarket) {
        // Another order for the same market
        if (order.rate === priorRate) {
          // Another order for the same rate
          depthElement[1] += order.amount
        } else {
          // The first order for a new rate
          retVal[market][orderBookKey].push(depthElement)
          priorRate = order.rate
          depthElement = [order.rate, order.amount]
        }
      } else {
        // The first order for a new market
        priorMarket = market
        priorRate = undefined

        // Initialize if not already initialized
        if (!retVal[market]) { retVal[market] = {asks: [], bids: []} }

        // This must also be the first order for the new market
        priorRate = order.rate
        depthElement = [order.rate, order.amount]
      }
    })

    // If we saw any orders then we have a final depthElement to append
    if (orders.length > 0) { retVal[market][orderBookKey].push(depthElement) }

    return orderBook
  }

  retVal = analyzeOrders(orders2Buy, sortCurPairAscRateDescDatetimeAsc, retVal, 'bids')
  retVal = analyzeOrders(orders2Sell, sortCurPairAscRateAscDatetimeAsc, retVal, 'asks')

  return retVal
}

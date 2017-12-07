const config = require('config')
const sorters = require('../sorters')

module.exports = (currencyPair, depth, orders2Buy, orders2Sell, desiredOrderBookSeq) => {

  let retVal = {}
  config.get('testData.markets').forEach(market => {
    retVal[market] = {'asks': [], 'bids': [], 'isFrozen': '0', 'seq': desiredOrderBookSeq}
  })

  let depthElement

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

  const rounder = (number, precision) => Number(Math.round(number + 'e' + precision) + 'e-' + precision)

  // Given an array of buy or sell orders, a suitable sort function, the orderBook that we are building, and the key within the orderBook for new order depth elements, analyze the orders and incorporate the suitable order depth elements into the orderBook
  const analyzeOrders = (orders, sorter, orderBook, orderBookKey, maxDepth) => {
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
          // The first order for a new rate.
          if (retVal[market][orderBookKey].length < maxDepth) {
            // Then it's ok to push another depthElement
            retVal[market][orderBookKey].push([truncateOrPad2String(depthElement[0]), rounder(depthElement[1], 8)])
            priorRate = order.rate
            depthElement = [order.rate, order.amount]
          }
        }
      } else {
        // The first order for a new market. maxDepth should always be >= 1 so it's ok to do this.
        priorMarket = market
        priorRate = undefined

        // Initialize if not already initialized
        if (!retVal[market]) { retVal[market] = {asks: [], bids: []} }

        // This must also be the first order for the new market
        priorRate = order.rate
        depthElement = [order.rate, order.amount]
      }
    })

    // If we saw any orders then we have a final depthElement to append, but only if we would not otherwise exceed maxDepth
    if (orders.length > 0 && retVal[market][orderBookKey].length < maxDepth) {
      retVal[market][orderBookKey].push([truncateOrPad2String(depthElement[0]), rounder(depthElement[1], 8)])
    }

    return orderBook
  }

  if (depth > 0) {
    retVal = analyzeOrders(orders2Buy, sorters.sortCurPairAscRateDescDatetimeAsc, retVal, 'bids', depth)
    retVal = analyzeOrders(orders2Sell, sorters.sortCurPairAscRateAscDatetimeAsc, retVal, 'asks', depth)
  }

  return currencyPair === 'all' ? retVal : retVal[currencyPair]
}

const c = require('../../poloConstants')
const sorters = require('../sorters')

module.exports = (sellOrder, engine) => {
  // Do we have enough quoteCurrency to make this purchase?
  // tweak this to exclude encumbered balances
  const quoteCurrency = sellOrder.currencyPair.split('_')[1]
  const balances = engine.returnBalances(sellOrder.apiKey, engine.deposits, engine.withdrawals)
  const balance = (quoteCurrency in balances) ? balances[quoteCurrency] : 0
  const total = sellOrder.amount * sellOrder.rate
  if (total > balance) { return {error: c.sell.NOT_ENOUGH + ' ' + quoteCurrency + '.'} }

  // This is an 'ordinary' order if none of the 3 special flags are set.
  const fOrdinary = !(sellOrder.fillOrKill || sellOrder.immediateOrCancel || sellOrder.postOnly)
  const orderCurrencies = sellOrder.currencyPair.split('_')

  if (sellOrder.fillOrKill) {
    // 1. First find all candidate buy orders, if any, for the given currencyPair where the bid rate >= the sellOrder rate
    const n1 = engine.orders2Buy
      .filter(existingOrder => existingOrder.currencyPair === sellOrder.currencyPair)
      .filter(existingOrder => existingOrder.rate >= sellOrder.rate)
      .filter(existingOrder => existingOrder.amount > 0)

    // 2. Are the sum of these candidate orders sufficient to fill this order in its entirety?
    // Note: If there are no candidate sell orders then their sum = 0
    const availableQuantity = n1.reduce((sum, existingOrder) => sum + existingOrder.amount, 0)
    if (availableQuantity >= sellOrder.amount) {
      // This order can be filled in its entirety.
      // Now sort the candidate orders in the order of consumption (by bid DESC, dt ASC).
      let n2 = n1.sort(sorters.sortRateDescDatetimeAsc)

      // 2.1. Now consume these orders in order until the sell order is filled.
      let quanRemaining = sellOrder.amount
      const newTrades = []

      // We know there are enough orders for this loop to terminate
      while (quanRemaining > 0) {
        const candidateOrder = n2[0]

        // can this candidateOrder satisfy the remaining quantity?
        if (candidateOrder.amount >= quanRemaining) {
          // yes it can
          newTrades.push(
            {
              amount: quanRemaining,
              date: engine.desiredTradeDate ? engine.desiredTradeDate : Date.now(),
              orderNumber: candidateOrder.orderNumber,
              rate: candidateOrder.rate,
              total: quanRemaining * candidateOrder.rate,
              tradeID: '1',
              type: 'sell',
              baseCurrency: orderCurrencies[0],
              quoteCurrency: orderCurrencies[1]
            }
          )
          candidateOrder.amount -= quanRemaining
          if (candidateOrder.amount <= 0) { n2.shift() }
          break // The sell order is fulfilled. Done with this loop
        } else {
          // no it cannot
          newTrades.push(
            {
              amount: candidateOrder.amount,
              date: engine.desiredTradeDate ? engine.desiredTradeDate : Date.now(),
              orderNumber: candidateOrder.orderNumber,
              rate: candidateOrder.rate,
              total: candidateOrder.amount * candidateOrder.rate,
              tradeID: '1',
              type: 'sell',
              baseCurrency: orderCurrencies[0],
              quoteCurrency: orderCurrencies[1]
            }
          )
          quanRemaining -= candidateOrder.amount
          candidateOrder.amount = 0
          n2.shift()
        }
      }

      return ({orderNumber: '1', resultingTrades: newTrades})
    } else {
      // This order cannot be filled in its entirety. Error.
      return { error: c.UNABLE_TO_FILL_ORDER_COMPLETELY }
    }
  } else if (sellOrder.immediateOrCancel || fOrdinary) {
    // ordinary and immediateOrCancel orders are handled the exact same way _except_ for a minor difference.
    // 1. First find all candidate buy orders, if any, for the given currencyPair where the bid rate >= the sellOrder rate
    const n1 = engine.orders2Buy
      .filter(existingOrder => existingOrder.currencyPair === sellOrder.currencyPair)
      .filter(existingOrder => existingOrder.rate >= sellOrder.rate)
      .filter(existingOrder => existingOrder.amount > 0)

    // 2. Now sort the candidate orders in the order of consumption (by rate DESC, dt ASC).
    let n2 = n1.sort(sorters.sortRateDescDatetimeAsc)

    // 3. Now consume these orders, in order, until either the sell order is filled or the buy orders are consumed.
    let quanRemaining = sellOrder.amount
    const newTrades = []

    while (quanRemaining > 0 && n2.length > 0) {
      const candidateOrder = n2[0]

      // can this candidateOrder satisfy the remaining quantity?
      if (candidateOrder.amount >= quanRemaining) {
        // yes it can
        newTrades.push(
          {
            amount: quanRemaining,
            date: engine.desiredTradeDate ? engine.desiredTradeDate : Date.now(),
            orderNumber: candidateOrder.orderNumber,
            rate: candidateOrder.rate,
            total: quanRemaining * candidateOrder.rate,
            tradeID: '1',
            type: 'sell',
            baseCurrency: orderCurrencies[0],
            quoteCurrency: orderCurrencies[1]
          }
        )
        candidateOrder.amount -= quanRemaining
        quanRemaining = 0
        if (candidateOrder.amount <= 0) { n2.shift() }
        break // The sell order is fulfilled. Done with this loop
      } else {
        // no it cannot
        newTrades.push(
          {
            amount: candidateOrder.amount,
            date: engine.desiredTradeDate ? engine.desiredTradeDate : Date.now(),
            orderNumber: candidateOrder.orderNumber,
            rate: candidateOrder.rate,
            total: candidateOrder.amount * candidateOrder.rate,
            tradeID: '1',
            type: 'sell',
            baseCurrency: orderCurrencies[0],
            quoteCurrency: orderCurrencies[1]
          }
        )
        quanRemaining -= candidateOrder.amount
        candidateOrder.amount = 0
        n2.shift()
      }
    }

    const retVal = {orderNumber: '1', resultingTrades: newTrades}

    if (sellOrder.immediateOrCancel) { retVal.amountUnfilled = quanRemaining }

    if (quanRemaining > 0 && fOrdinary) {
      // Add a new sell order for the remainder
      sellOrder.amount = quanRemaining
      engine.orders2Sell.push(sellOrder)
    }

    return retVal
  } else if (sellOrder.postOnly) {
    // 1. First find all candidate buy orders, if any, for the given currencyPair where the bid rate >= the sellOrder rate
    const n1 = engine.orders2Buy
      .filter(existingOrder => existingOrder.currencyPair === sellOrder.currencyPair)
      .filter(existingOrder => existingOrder.rate >= sellOrder.rate)
      .filter(existingOrder => existingOrder.amount > 0)

    // 2. If there are any such buy orders then this sell order could be partially or fully executed.
    // We don't want _any_ execution so therefore fail.
    if (n1.length > 0) { return { error: c.UNABLE_TO_PLACE_POSTONLY_ORDER_AT_THIS_PRICE } }

    // This sell order cannot be fulfilled at all at this time.  Therefore accept the order.
    engine.orders2Sell.push(sellOrder)
    return {orderNumber: '1', resultingTrades: []}
  }
}

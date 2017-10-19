const poloConstants = require('../../poloConstants')

module.exports = (newOrder, orders2Buy, orders2Sell) => {
  // Sort an array by rate ASC, Dt ASC. This is intended to sort an array of sell orders.
  const sortRateAscDatetimeAsc = function (a, b) {
    if (a.rate < b.rate) return -1
    if (a.rate > b.rate) return 1

    // a.rate must be equal to b.rate. Now sort by dt
    if (a.dt < b.dt) return -1
    if (a.dt > b.dt) return 1

    // a.dt must be equal to b.dt.
    return 0
  }

  // This is an 'ordinary' order if none of the 3 special flags are set.
  const fOrdinary = !(newOrder.fillOrKill || newOrder.immediateOrCancel || newOrder.postOnly)
  const orderCurrencies = newOrder.currencyPair.split('_')

  if (newOrder.fillOrKill) {
    // 1. First find all candidate sell orders, if any, for the given currencyPair where the ask rate <= the newOrder bid rate
    const n1 = orders2Sell
      .filter(existingOrder => existingOrder.currencyPair === newOrder.currencyPair)
      .filter(existingOrder => existingOrder.rate <= newOrder.rate)
      .filter(existingOrder => existingOrder.amount > 0)

    // 2. Are the sum of these candidate orders sufficient to fill this order in its entirety?
    // Note: If there are no candidate sell orders then their sum = 0
    const availableQuantity = n1.reduce((sum, existingOrder) => sum + existingOrder.amount, 0)
    if (availableQuantity >= newOrder.amount) {
      // This order can be filled in its entirety.
      // Now sort the candidate orders in the order of consumption (by ask ASC, dt ASC).
      let n2 = n1.sort(sortRateAscDatetimeAsc)

      // 2.1. Now consume these orders in order until the buy order is filled.
      let quanRemaining = newOrder.amount
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
              date: '2017-10-07 11:55:18',
              rate: candidateOrder.rate,
              total: quanRemaining * candidateOrder.rate,
              tradeID: '1',
              type: 'buy',
              baseCurrency: orderCurrencies[0],
              quoteCurrency: orderCurrencies[1]
            }
          )
          candidateOrder.amount -= quanRemaining
          if (candidateOrder.amount <= 0) { n2.shift() }
          break // The buy order is fulfilled. Done with this loop
        } else {
          // no it cannot
          newTrades.push(
            {
              amount: candidateOrder.amount,
              date: '2017-10-07 11:55:18',
              rate: candidateOrder.rate,
              total: candidateOrder.amount * candidateOrder.rate,
              tradeID: '1',
              type: 'buy',
              baseCurrency: orderCurrencies[0],
              quoteCurrency: orderCurrencies[1]
            }
          )
          quanRemaining -= candidateOrder.amount
          candidateOrder.amount = 0
          n2.shift()
        }
      }

      return (
        {
          orderNumber: '1',
          resultingTrades: newTrades
        }
      )
    } else {
      // This order cannot be filled in its entirety. Error.
      return { error: poloConstants.UNABLE_TO_FILL_ORDER_COMPLETELY }
    }
  } else if (newOrder.immediateOrCancel || fOrdinary) {
    // ordinary and immediateOrCancel orders are handled the exact same way _except_ for a minor difference.
    // 1. First find all candidate sell orders, if any, for the given currencyPair where the ask rate <= the newOrder rate
    const n1 = orders2Sell
      .filter(existingOrder => existingOrder.currencyPair === newOrder.currencyPair)
      .filter(existingOrder => existingOrder.rate <= newOrder.rate)
      .filter(existingOrder => existingOrder.amount > 0)

    // 2. Now sort the candidate orders in the order of consumption (by ask ASC, dt ASC).
    let n2 = n1.sort(sortRateAscDatetimeAsc)

    // 3. Now consume these orders, in order, until either the buy order is filled or the sell orders are consumed.
    let quanRemaining = newOrder.amount
    const newTrades = []

    while (quanRemaining > 0 && n2.length > 0) {
      const candidateOrder = n2[0]

      // can this candidateOrder satisfy the remaining quantity?
      if (candidateOrder.amount >= quanRemaining) {
        // yes it can
        newTrades.push(
          {
            amount: quanRemaining,
            date: '2017-10-07 11:55:18',
            rate: candidateOrder.rate,
            total: quanRemaining * candidateOrder.rate,
            tradeID: '1',
            type: 'buy',
            baseCurrency: orderCurrencies[0],
            quoteCurrency: orderCurrencies[1]
          }
        )
        candidateOrder.amount -= quanRemaining
        quanRemaining = 0
        if (candidateOrder.amount <= 0) { n2.shift() }
        break // The buy order is fulfilled. Done with this loop
      } else {
        // no it cannot
        newTrades.push(
          {
            amount: candidateOrder.amount,
            date: '2017-10-07 11:55:18',
            rate: candidateOrder.rate,
            total: candidateOrder.amount * candidateOrder.rate,
            tradeID: '1',
            type: 'buy',
            baseCurrency: orderCurrencies[0],
            quoteCurrency: orderCurrencies[1]
          }
        )
        quanRemaining -= candidateOrder.amount
        candidateOrder.amount = 0
        n2.shift()
      }
    }

    const retVal = {
      orderNumber: '1',
      resultingTrades: newTrades
    }

    if (newOrder.immediateOrCancel) { retVal.amountUnfilled = quanRemaining }

    if (quanRemaining > 0 && fOrdinary) {
      // Add a new buy order for the remainder
      newOrder.amount = quanRemaining
      orders2Buy.push(newOrder)
    }

    return retVal
  } else if (newOrder.postOnly) {
    // 1. First find all candidate sell orders, if any, for the given currencyPair where the ask rate <= the newOrder rate
    const n1 = orders2Sell
      .filter(existingOrder => existingOrder.currencyPair === newOrder.currencyPair)
      .filter(existingOrder => existingOrder.rate <= newOrder.rate)
      .filter(existingOrder => existingOrder.amount > 0)

    // 2. If there are any such sell orders then this buy order could be partially or fully executed.
    // We don't want _any_ execution so therefore fail.
    if (n1.length > 0) { return { error: poloConstants.UNABLE_TO_PLACE_POSTONLY_ORDER_AT_THIS_PRICE } }

    // This buy order cannot be fulfilled at all at this time.  Therefore accept the order.
    orders2Buy.push(newOrder)
    return {orderNumber: '1', resultingTrades: []}
  }
}

const poloConstants = require('../../poloConstants')

module.exports = (newOrder, orders2Buy, orders2Sell) => {

  // Sort an array by rate DESC, Dt ASC. This is intended to sort an array of buy orders.
  const sort_RateDESC_DtASC = function (a, b) {
    if (a.rate > b.rate) return -1
    if (a.rate < b.rate) return 1

    // a.rate must be equal to b.rate. Now sort by dt
    if (a.dt < b.dt) return -1
    if (a.dt > b.dt) return 1

    // a.dt must be equal to b.dt.
    return 0
  }

  // This is an 'ordinary' order if none of the 3 special flags are set.
  const fOrdinary = !(newOrder.fillOrKill || newOrder.immediateOrCancel || newOrder.postOnly)

  if(newOrder.fillOrKill) {

    // 1. First find all candidate buy orders, if any, for the given currencyPair where the bid rate >= the newOrder rate
    const n1 = orders2Buy
      .filter(existingOrder => existingOrder.currencyPair === newOrder.currencyPair)
      .filter(existingOrder => existingOrder.rate >= newOrder.rate)
      .filter(existingOrder => existingOrder.amount > 0)

    // 2. Are the sum of these candidate orders sufficient to fill this order in its entirety?
    // Note: If there are no candidate sell orders then their sum = 0
    const availableQuantity = n1.reduce((sum, existingOrder) => sum + existingOrder.amount, 0)
    if(availableQuantity >= newOrder.amount) {
      // This order can be filled in its entirety.
      // Now sort the candidate orders in the order of consumption (by bid DESC, dt ASC).
      let n2 = n1.sort(sort_RateDESC_DtASC)

      // 2.1. Now consume these orders in order until the sell order is filled.
      let quanRemaining = newOrder.amount
      const newTrades = []

      // We know there are enough orders for this loop to terminate
      while(quanRemaining > 0) {
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
              type: 'sell'
            }
          )
          candidateOrder.amount -= quanRemaining
          if (candidateOrder.amount <= 0)
            n2.shift()
          break // The sell order is fulfilled. Done with this loop

        } else {
          // no it cannot
          newTrades.push(
            {
              amount: candidateOrder.amount,
              date: '2017-10-07 11:55:18',
              rate: candidateOrder.rate,
              total: candidateOrder.amount * candidateOrder.rate,
              tradeID: '1',
              type: 'sell'
            }
          )
          quanRemaining -= candidateOrder.amount
          candidateOrder.amount = 0
          n2.shift()
        }

      }

      return(
        {
          orderNumber: '1',
          resultingTrades: newTrades
        }
      )

    } else {
      // This order cannot be filled in its entirety. Error.
      return { error: poloConstants.UNABLE_TO_FILL_ORDER_COMPLETELY }
    }

  }

  // ordinary and immediateOrCancel orders are handled the exact same way _except_ for a minor difference.
  else if(newOrder.immediateOrCancel || fOrdinary) {

    // 1. First find all candidate buy orders, if any, for the given currencyPair where the bid rate >= the newOrder rate
    const n1 = orders2Buy
      .filter(existingOrder => existingOrder.currencyPair === newOrder.currencyPair)
      .filter(existingOrder => existingOrder.rate >= newOrder.rate)
      .filter(existingOrder => existingOrder.amount > 0)

    // 2. Now sort the candidate orders in the order of consumption (by rate DESC, dt ASC).
    let n2 = n1.sort(sort_RateDESC_DtASC)

    // 3. Now consume these orders, in order, until either the sell order is filled or the buy orders are consumed.
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
            type: 'sell'
          }
        )
        candidateOrder.amount -= quanRemaining
        quanRemaining = 0
        if (candidateOrder.amount <= 0)
          n2.shift()
        break // The sell order is fulfilled. Done with this loop

      } else {
        // no it cannot
        newTrades.push(
          {
            amount: candidateOrder.amount,
            date: '2017-10-07 11:55:18',
            rate: candidateOrder.rate,
            total: candidateOrder.amount * candidateOrder.rate,
            tradeID: '1',
            type: 'sell'
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

    if(newOrder.immediateOrCancel)
      retVal.amountUnfilled = quanRemaining

    if(quanRemaining > 0 && fOrdinary) {
      // Add a new sell order for the remainder
      newOrder.amount = quanRemaining
      orders2Sell.push(newOrder)
    }

    return retVal
  }

  else if(newOrder.postOnly) {

    // 1. First find all candidate buy orders, if any, for the given currencyPair where the bid rate >= the newOrder rate
    const n1 = orders2Buy
      .filter(existingOrder => existingOrder.currencyPair === newOrder.currencyPair)
      .filter(existingOrder => existingOrder.rate >= newOrder.rate)
      .filter(existingOrder => existingOrder.amount > 0)

    // 2. If there are any such buy orders then this sell order could be partially or fully executed.
    // We don't want _any_ execution so therefore fail.
    if(n1.length > 0)
      return { error: poloConstants.UNABLE_TO_PLACE_POSTONLY_ORDER_AT_THIS_PRICE }

    // This sell order cannot be fulfilled at all at this time.  Therefore accept the order.
    orders2Sell.push(newOrder)
    return {orderNumber: '1', resultingTrades: [] }
  }
}

const c = require('../../poloConstants')
const sorters = require('../sorters')

module.exports = (buyOrder, engine) => {
  // Do we have enough baseCurrency to make this purchase?
  // tweak this to exclude encumbered balances
  const baseCurrency = buyOrder.currencyPair.split('_')[0]
  const balances = engine.returnBalances(buyOrder.apiKey, engine.deposits, engine.withdrawals)
  const balance = (baseCurrency in balances) ? balances[baseCurrency] : 0
  const total = buyOrder.amount * buyOrder.rate
  if (total > balance) { return {'error': c.NOT_ENOUGH + ' ' + baseCurrency + '.'} }

  // This is an 'ordinary' order if none of the 3 special flags are set.
  const fOrdinary = !(buyOrder.fillOrKill || buyOrder.immediateOrCancel || buyOrder.postOnly)
  const orderCurrencies = buyOrder.currencyPair.split('_')

  if (buyOrder.fillOrKill) {
    // 1. First find all candidate sell orders, if any, for the given currencyPair where the ask rate <= the buyOrder bid rate
    const n1 = engine.orders2Sell
      .filter(existingOrder => existingOrder.currencyPair === buyOrder.currencyPair)
      .filter(existingOrder => existingOrder.rate <= buyOrder.rate)
      .filter(existingOrder => existingOrder.amount > 0)

    // 2. Are the sum of these candidate orders sufficient to fill this order in its entirety?
    // Note: If there are no candidate sell orders then their sum = 0
    const availableQuantity = n1.reduce((sum, existingOrder) => sum + existingOrder.amount, 0)
    if (availableQuantity >= buyOrder.amount) {
      // This order can be filled in its entirety.
      // Now sort the candidate orders in the order of consumption (by ask ASC, dt ASC).
      let n2 = n1.sort(sorters.sortRateAscDatetimeAsc)

      // 2.1. Now consume these orders in order until the buy order is filled.
      let quanRemaining = buyOrder.amount
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
              date: engine.desiredTradeDate ? engine.desiredTradeDate : Date.now(),
              orderNumber: candidateOrder.orderNumber,
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

      return ({orderNumber: '1', resultingTrades: newTrades})
    } else {
      // This order cannot be filled in its entirety. Error.
      return { error: c.UNABLE_TO_FILL_ORDER_COMPLETELY }
    }
  } else if (buyOrder.immediateOrCancel || fOrdinary) {
    // ordinary and immediateOrCancel orders are handled the exact same way _except_ for a minor difference.
    // 1. First find all candidate sell orders, if any, for the given currencyPair where the ask rate <= the buyOrder rate
    const n1 = engine.orders2Sell
      .filter(existingOrder => existingOrder.currencyPair === buyOrder.currencyPair)
      .filter(existingOrder => existingOrder.rate <= buyOrder.rate)
      .filter(existingOrder => existingOrder.amount > 0)

    // 2. Now sort the candidate orders in the order of consumption (by ask ASC, dt ASC).
    let n2 = n1.sort(sorters.sortRateAscDatetimeAsc)

    // 3. Now consume these orders, in order, until either the buy order is filled or the sell orders are consumed.
    let quanRemaining = buyOrder.amount
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
            date: engine.desiredTradeDate ? engine.desiredTradeDate : Date.now(),
            orderNumber: candidateOrder.orderNumber,
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

    const retVal = {orderNumber: '1', resultingTrades: newTrades}

    if (buyOrder.immediateOrCancel) { retVal.amountUnfilled = quanRemaining }

    if (quanRemaining > 0 && fOrdinary) {
      // Add a new buy order for the remainder
      buyOrder.amount = quanRemaining
      engine.orders2Buy.push(buyOrder)
    }

    return retVal
  } else if (buyOrder.postOnly) {
    // 1. First find all candidate sell orders, if any, for the given currencyPair where the ask rate <= the buyOrder rate
    const n1 = engine.orders2Sell
      .filter(existingOrder => existingOrder.currencyPair === buyOrder.currencyPair)
      .filter(existingOrder => existingOrder.rate <= buyOrder.rate)
      .filter(existingOrder => existingOrder.amount > 0)

    // 2. If there are any such sell orders then this buy order could be partially or fully executed.
    // We don't want _any_ execution so therefore fail.
    if (n1.length > 0) { return { error: c.UNABLE_TO_PLACE_POSTONLY_ORDER_AT_THIS_PRICE } }

    // This buy order cannot be fulfilled at all at this time.  Therefore accept the order.
    engine.orders2Buy.push(buyOrder)
    return {orderNumber: '1', resultingTrades: []}
  }
}

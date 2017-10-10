const poloConstants = require('../poloConstants')

function Engine() {
  this.orders2Buy  = []
  this.orders2Sell = []
  this.trades      = []
}

Engine.prototype.buy = function(newOrder) {

  if(newOrder.fillOrKill) {

    // 1. First find all candidate sell orders, if any, for the given currencyPair where the ask rate <= the newOrder rate
    const n1 = this.orders2Sell
      .filter(existingOrder => existingOrder.currencyPair === newOrder.currencyPair)
      .filter(existingOrder => existingOrder.rate <= newOrder.rate)
      .filter(existingOrder => existingOrder.amount > 0)

    // 2. Are the sum of these candidate orders sufficient to fill this order in its entirety?
    // Note: If there are no candidate sell orders then their sum = 0
    const availableQuantity = n1.reduce((sum, existingOrder) => sum + existingOrder.amount, 0)
    if(availableQuantity >= newOrder.amount) {
      // This order can be filled in its entirety.
      // Now sort the candidate orders in the order of consumption (by ask ASC, dt ASC).
      let n2 = n1.sort(function (a, b) {
        if (a.rate < b.rate) return -1
        if (a.rate > b.rate) return 1

        // a.rate must be equal to b.rate. Now sort by dt
        if (a.dt < b.dt) return -1
        if (a.dt > b.dt) return 1

        // a.dt must be equal to b.dt.
        return 0;
      })

      // 2.1. Now consume these orders in order until the buy order is filled.
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
              type: 'buy'
            }
          )
          candidateOrder.amount -= quanRemaining
          if (candidateOrder.amount <= 0)
            n2.shift()
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
              type: 'buy'
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
}

Engine.prototype.sell = function(newOrder) {
  this.orders2Sell.push(newOrder)
}

module.exports = new Engine()

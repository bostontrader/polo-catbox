const c = require('../../poloConstants')

module.exports = (user, orderNumber, orders2Buy, orders2Sell) => {
  const n1 = orders2Buy.concat(orders2Sell)
  const n2 = n1.filter(order => (order.apiKey === user && order.orderNumber === orderNumber && order.amount > 0))
  const cnt = n2.length
  if (cnt <= 0) { return {error: c.cancelOrder.INVALID_OR_NOT_YOU, 'success': 0} }
  if (cnt === 1) {
    n2[0].amount = 0 // This is how we say "cancel" the order.
    return {'success': 1}
  }

  // This should never happen.  There should never be more than 1 order with the same orderNumber.
  return {error: 'maxfubar error'}
}

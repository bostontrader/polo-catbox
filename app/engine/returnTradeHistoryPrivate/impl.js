var dateFormat = require('dateformat')

module.exports = (user, desiredCurrencyPair, start, end, limit, trades) => {
  let retVal = []
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

  const n1 = (desiredCurrencyPair === 'all')
    ? trades.filter(trade => start <= trade.date && trade.date <= end)
    : trades.filter(trade => start <= trade.date && trade.date <= end && (trade.baseCurrency + '_' + trade.quoteCurrency) === desiredCurrencyPair)

  if (n1.length > 0) retVal = {}

  n1.forEach(trade => {
    const currencyPair = trade.baseCurrency + '_' + trade.quoteCurrency
    if (!(currencyPair in retVal)) { retVal[currencyPair] = [] }
    const xformOrder = {
      globalTradeID: 123,
      tradeID: trade.tradeID,
      date: dateFormat(trade.date * 1000, 'yyyy-mm-dd HH:MM:ss', true),
      rate: truncateOrPad2String(trade.rate),
      amount: truncateOrPad2String(trade.amount),
      total: truncateOrPad2String(trade.total),
      // fee: truncateOrPad2String(trade.fee),
      fee: truncateOrPad2String(0.0015),
      orderNumber: trade.orderID,
      type: trade.type,
      category: 'exchange'
    }
    retVal[currencyPair].push(xformOrder)
  })
  return retVal
}

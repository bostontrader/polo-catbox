module.exports = (market, start, end, trades) => {
  let retVal = []
  trades.filter(trade => trade.baseCurrency + '_' + trade.quoteCurrency === market && start <= trade.date && trade.date <= end).forEach(trade => {
    retVal.push({globalTradeID: 240000000, tradeID: trade.tradeID, date: trade.date, type: trade.type, rate: trade.rate, amount: trade.amount, total: trade.total})
  })
  return retVal
}

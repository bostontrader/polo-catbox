module.exports = (market, trades) => {
  let retVal = []
  trades.filter(trade => trade.baseCurrency + '_' + trade.quoteCurrency === market).forEach(trade => {
    retVal.push({globalTradeID: 240000000, tradeID: trade.tradeID, date: trade.date, type: trade.type, rate: trade.rate, amount: trade.amount, total: trade.total})
  })
  return retVal
}

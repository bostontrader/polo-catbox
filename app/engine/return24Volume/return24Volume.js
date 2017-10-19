module.exports = (trades) => {
  const retVal = {totalBTC: 0, totalETH: 0, totalXMR: 0, totalUSDT: 0, totalXUSD: 0}

  trades.forEach(trade => {
    const base = trade.baseCurrency
    const quote = trade.quoteCurrency
    const market = base + '_' + quote

    if (retVal[market]) {
      retVal[market][base] += trade.total
      retVal[market][quote] += trade.amount
    } else {
      const n = {}
      n[base] = trade.total
      n[quote] = trade.amount
      retVal[market] = n
    }

    if (base === 'BTC') { retVal.totalBTC += trade.total }
    if (base === 'ETH') { retVal.totalETH += trade.total }
    if (base === 'XMR') { retVal.totalXMR += trade.total }
    if (base === 'USDT') { retVal.totalUSDT += trade.total }
    if (base === 'XUSD') { retVal.totalXUSD += trade.total }
  })

  return retVal
}

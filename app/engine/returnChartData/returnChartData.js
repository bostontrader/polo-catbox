module.exports = (market, start, end, period, engine) => {
  let retVal = []
  let chartElement
  let chartElementDate = start
  let chartElementPending = false
  let amountRateSum // use this to calculate the weighted average price
  let nextDateThreshold = start + period
  // let period = 900
  let veryFirstTrade = true
  // let firstTradeThisPeriod

  const n = engine.trades
    // all trades for the desired market within the given time period
    .filter(trade => (trade.baseCurrency + '_' + trade.quoteCurrency === market) && start <= trade.date && trade.date <= end)

    // sorted by date ASC
    .sort(trade => (a, b) => a.date === b.date ? 0 : a.date > b.date ? 1 : -1)

  n.forEach(trade => {
    if (veryFirstTrade) {
      veryFirstTrade = false
      // firstTradeThisPeriod = true
      // nextDateThreshold = trade.date + period

      // Dup A.  This is duplicated elsewhere.
      chartElement = {date: chartElementDate, high: trade.rate, low: trade.rate, open: trade.rate, close: trade.rate, volume: trade.total, quoteVolume: trade.amount, weightedAverage: trade.rate}
      amountRateSum = trade.amount * trade.rate
      chartElementPending = true
    } else {
      if (trade.date < nextDateThreshold) {
        // The period has not changed
        if (trade.rate > chartElement.high) chartElement.high = trade.rate
        if (trade.rate < chartElement.low) chartElement.low = trade.rate
        chartElement.volume += trade.total
        chartElement.quoteVolume += trade.amount

        amountRateSum += trade.amount * trade.rate
        chartElement.weightedAverage = amountRateSum / chartElement.quoteVolume
        chartElement.close = trade.rate // in case this is the last trade of this period
      } else {
        // This is a new period.
        retVal.push(chartElement)
        chartElementDate = nextDateThreshold
        nextDateThreshold += period

        // Advance over zero or more empty periods to get to the period that contains the present trade.
        while (nextDateThreshold < trade.date) {
          // Now build an empty chart element
          chartElement = {date: chartElementDate, high: undefined, low: undefined, open: undefined, close: undefined, volume: 0, quoteVolume: 0, NaN}
          retVal.push(chartElement)
          chartElementDate = nextDateThreshold
          nextDateThreshold += period
        }

        // Now we expect that this is the first trade of the new period.
        // Dup A.  This is duplicated elsewhere.
        chartElement = {date: chartElementDate, high: trade.rate, low: trade.rate, open: trade.rate, close: trade.rate, volume: trade.total, quoteVolume: trade.amount, weightedAverage: trade.rate}

        amountRateSum = trade.amount * trade.rate
        // chartElementPending = true // probably don't really need this
      }
    }

    // retVal.push(chartElement)
  })

  // If we have seen any trades then there is a final entry to append to the return value
  if (chartElementPending) { retVal.push(chartElement) }
  return retVal
}

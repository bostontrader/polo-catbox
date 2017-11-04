module.exports = (market, start, end, period, engine) => {
  let retVal = []
  let candleStick
  let candleStickDatetime

  // 1. Remove this idiotic possibility first.
  if (end < start) { return [engine.emptyCandleStick] }

  // 2. Determine the actual starting datetimes for the start and end periods
  let startPeriodDatetime = Math.floor(start / period) * period
  let endPeriodDatetime = Math.floor(end / period) * period

  const relevantTrades = engine.trades
    // all trades for the desired market within the given time period
    .filter(trade => (trade.baseCurrency + '_' + trade.quoteCurrency === market) && startPeriodDatetime <= trade.date && trade.date < endPeriodDatetime + period)

    // sorted by datetime ASC
    .sort(trade => (a, b) => a.date === b.date ? 0 : a.date > b.date ? 1 : -1)

  // If there are zero trades during the time period then return the empty element
  if (relevantTrades.length === 0) { return [engine.emptyCandleStick] }

  // Assume start <= end so that we have at least one candleStick
  candleStickDatetime = startPeriodDatetime
  do {
    const relevantTradesThisPeriod = relevantTrades.filter(trade => candleStickDatetime <= trade.date && trade.date < candleStickDatetime + period)

    if (relevantTradesThisPeriod.length > 0) {
      candleStick = engine.returnCandleStick(relevantTradesThisPeriod)
      candleStick.date = candleStickDatetime
    } else {
      candleStick = engine.emptyCandleStick
    }
    retVal.push(candleStick)
    candleStickDatetime += period
  } while (candleStickDatetime <= endPeriodDatetime)

  return retVal
}

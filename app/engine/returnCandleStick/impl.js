const engine = require('../tradeEngine')

/*
Given an array of trades, sorted in chronological order, return a candlestick summary.
 */
module.exports = (trades) => {
  let retVal = Object.assign({}, engine.undefinedCandleStick)
  let amountRateSum = 0 // use this to calculate the weighted average price

  let firstTrade = true
  trades.forEach(trade => {

    if (firstTrade) { firstTrade = false; retVal.open = trade.rate }
    if (!retVal.high || trade.rate > retVal.high) retVal.high = trade.rate
    if (!retVal.low || trade.rate < retVal.low) retVal.low = trade.rate
    retVal.volume += trade.total
    retVal.quoteVolume += trade.amount

    amountRateSum += trade.amount * trade.rate
    retVal.weightedAverage = amountRateSum / retVal.quoteVolume
    retVal.close = trade.rate // in case this is the last trade
  })

  return retVal
}

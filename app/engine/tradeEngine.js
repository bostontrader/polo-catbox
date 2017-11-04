function Engine () {
  this.brainWipe()
}

Engine.prototype.brainWipe = function () {
  this.orders2Buy = []
  this.orders2Sell = []
  this.trades = []
  this.desiredTradeDate = undefined
}

Engine.prototype.returnTicker =
  function (markets) { return require('./returnTicker/impl')(markets, this.orders2Buy, this.orders2Sell, this.trades) }

Engine.prototype.return24Volume = function () { return require('./return24Volume/impl')(this.trades) }

Engine.prototype.returnOrderBook = function () { return require('./returnOrderBook/impl')(this.orders2Buy, this.orders2Sell) }

Engine.prototype.returnTradeHistory = function (market) { return require('./returnTradeHistory/impl')(market, this.trades) }

Engine.prototype.returnChartData = function (market, start, end, period) { return require('./returnChartData/impl')(market, start, end, period, this) }

Engine.prototype.buy = function (newOrder) {
  const result = require('./buy/impl')(newOrder, this)
  if ('resultingTrades' in result) { this.trades = this.trades.concat(result.resultingTrades) }
  return result
}

Engine.prototype.sell = function (newOrder) {
  const result = require('./sell/impl')(newOrder, this)
  if ('resultingTrades' in result) { this.trades = this.trades.concat(result.resultingTrades) }
  return result
}

Engine.prototype.createLoanOffer = function (currency, amount, duration, autoRenew, lendingRate) { return require('./createLoanOffer/impl')(currency, amount, duration, autoRenew, lendingRate, this) }

// undefinedCandleStick and emptyCandleStick look pretty similar.  But there are some subtle differences that justify their existences.  Any attempt to unify these will probably founder on nettlesome code irritants.  Better to just accept this beautiful diversity.

// Use this to begin collecting the summary info
Engine.prototype.undefinedCandleStick = {
  high: undefined,
  low: undefined,
  open: undefined,
  close: undefined,
  volume: 0,
  quoteVolume: 0,
  weightedAverage: undefined
}

// Use this as the API response.
Engine.prototype.emptyCandleStick = {
  date: 0,
  high: 0,
  low: 0,
  open: 0,
  close: 0,
  volume: 0,
  quoteVolume: 0,
  weightedAverage: 0
}

Engine.prototype.returnCandleStick = function (trades) { return require('./returnCandleStick/impl')(trades) }

module.exports = new Engine()

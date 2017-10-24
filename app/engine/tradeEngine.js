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

module.exports = new Engine()
